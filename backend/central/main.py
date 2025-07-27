import asyncio
import base64
import cv2
import numpy as np
import aiofiles
import concurrent.futures
from fastapi import FastAPI, UploadFile, File, Form
from contextlib import asynccontextmanager
import json
import logging
import os
import uuid
from datetime import datetime
import tempfile
import atexit
import httpx  # ← Added for async HTTP calls

# ----------- Config -----------
FRAME_INTERVAL = 5  # seconds
MOTION_THRESHOLD = 20
MAX_QUEUE_SIZE = 10  # for backpressure

ANOMALY_AGENT_URL = os.getenv("ANOMALY_AGENT_URL", "http://localhost:8003/detect-anomaly/")
BOTTLENECK_AGENT_URL = os.getenv("BOTTLENECK_AGENT_URL", "http://localhost:8002/analyze-density/")

# ----------- Logging Setup -----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("central-service")

# ----------- ThreadPool Executor -----------
EXECUTOR = concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count() or 4)
atexit.register(EXECUTOR.shutdown, wait=False)

# ----------- Lifespan Handler -----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

# ----------- FastAPI App -----------
app = FastAPI(lifespan=lifespan)

# ----------- Async Queue -----------
frame_queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)

# ----------- Helper: Extract Frames -----------
def extract_key_frames(video_path: str, interval: int, motion_threshold: int):
    frames = []
    vidcap = cv2.VideoCapture(video_path)
    fps = vidcap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(fps * interval)
    success, prev = vidcap.read()
    frame_id = 0

    while success:
        vidcap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
        success, frame = vidcap.read()
        if not success:
            break

        # 🔽 Downscale for motion detection
        small_frame = cv2.resize(frame, (320, 240))
        gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)
        prev_gray = cv2.cvtColor(cv2.resize(prev, (320, 240)), cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(prev_gray, gray)
        motion = np.mean(diff)

        if motion >= motion_threshold:
            # 📦 Compress frame
            _, jpeg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            frames.append((jpeg.tobytes(), frame_id, motion))

        prev = frame
        frame_id += frame_interval

    vidcap.release()
    return frames

# ----------- Async Video Processor -----------
async def process_video_async(video_path, interval, threshold):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(EXECUTOR, extract_key_frames, video_path, interval, threshold)

# ----------- Helper: Encode Frame -----------
def encode_frame(frame_bytes):
    return base64.b64encode(frame_bytes).decode("utf-8")

# ----------- Helper: Frame Metadata -----------
def create_frame_payload(encoded_frame, frame_id, motion, camera_id, location, zone_id):
    return json.dumps({
        "frame": encoded_frame,
        "frame_id": frame_id,
        "motion": motion,
        "camera_id": camera_id,
        "location": location,
        "zone_id": zone_id,
        "timestamp": datetime.utcnow().isoformat()
    })

# ----------- Main Endpoint: Upload Video and Forward Frames -----------
@app.post("/upload")
async def upload_video(
    video: UploadFile = File(...),
    camera_id: str = Form(...),
    location: str = Form(...),
    zone_id: str = Form(...)
):
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tmp_path = tmp_file.name
    tmp_file.close()

    async with aiofiles.open(tmp_path, 'wb') as tmp:
        while True:
            chunk = await video.read(1024 * 1024)
            if not chunk:
                break
            await tmp.write(chunk)

    logger.info(f"[📦] Video saved to {tmp_path}")

    frames = await process_video_async(tmp_path, FRAME_INTERVAL, MOTION_THRESHOLD)
    logger.info(f"[✅] Extracted {len(frames)} motion frames")

    os.remove(tmp_path)

    results = []

    async with httpx.AsyncClient(timeout=5.0) as client:
        for frame_bytes, frame_id, motion in frames:
            encoded = encode_frame(frame_bytes)
            payload = create_frame_payload(encoded, frame_id, motion, camera_id, location, zone_id)
            payload_dict = json.loads(payload)

            files = {"image": ("frame.jpg", frame_bytes, "image/jpeg")}
            form_data = {
                "camera_id": camera_id,
                "zone_id": zone_id,
                "location": location
            }

            anomaly_task = client.post(ANOMALY_AGENT_URL, data=form_data, files=files)
            bottleneck_task = client.post(BOTTLENECK_AGENT_URL, data=form_data, files=files)

            anomaly_resp, bottleneck_resp = await asyncio.gather(anomaly_task, bottleneck_task, return_exceptions=True)

            result = {
                "frame_id": frame_id,
                "motion": motion,
                "timestamp": payload_dict["timestamp"],
                "anomaly_response": {},
                "bottleneck_response": {}
            }

            if isinstance(anomaly_resp, Exception):
                logger.error(f"[❌] Anomaly Agent error: {anomaly_resp}")
                result["anomaly_response"] = {"error": str(anomaly_resp)}
            else:
                result["anomaly_response"] = anomaly_resp.json()

            if isinstance(bottleneck_resp, Exception):
                logger.error(f"[❌] Bottleneck Agent error: {bottleneck_resp}")
                result["bottleneck_response"] = {"error": str(bottleneck_resp)}
            else:
                result["bottleneck_response"] = bottleneck_resp.json()

            results.append(result)

    return {
        "message": f"Processed and forwarded {len(frames)} high-motion frames.",
        "results": results
    }
