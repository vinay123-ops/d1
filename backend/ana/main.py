from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager
import concurrent.futures
import atexit
import uuid
import logging
import asyncio
import json

# ---------------- Google Cloud Vision ----------------
from google.cloud import vision
from google.oauth2 import service_account

# ----------- Replace this path with your actual JSON credentials file path -----------
GOOGLE_CREDENTIALS_FILE = "./drishti-project-467115-32ad4c1a46b6.json"
credentials = service_account.Credentials.from_service_account_file(GOOGLE_CREDENTIALS_FILE)
vision_client = vision.ImageAnnotatorClient(credentials=credentials)

# ---------------- Logging ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("anomaly-detector")

# ----------- ThreadPool Executor -----------
EXECUTOR = concurrent.futures.ThreadPoolExecutor(max_workers=4)
atexit.register(EXECUTOR.shutdown, wait=False)

# ----------- Config -----------
HIGH_CONF_THRESHOLD = 0.8
MED_CONF_THRESHOLD = 0.5

# ---------------- FastAPI Init ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Anomaly Detection API", lifespan=lifespan)

# ---------------- Helper Functions ----------------

def _get_label(item):
    if isinstance(item, dict):
        return item.get("label")
    return str(item)

def _get_conf(item):
    if isinstance(item, dict):
        return float(item.get("confidence", 0.0))
    return 1.0

def map_dispatch_type(threats):
    for t in threats:
        if _get_label(t) in ("fire", "smoke"):
            return "fire"
    return "security"

def map_severity(threats):
    highest_conf = 0.0
    critical = False
    for t in threats:
        label = _get_label(t)
        conf = _get_conf(t)
        highest_conf = max(highest_conf, conf)
        if label in ("fire", "gun", "knife") and conf >= HIGH_CONF_THRESHOLD:
            critical = True
    if critical:
        return "high"
    if highest_conf >= MED_CONF_THRESHOLD:
        return "medium"
    return "low"

def generate_event_id():
    return f"anomaly_{uuid.uuid4().hex[:8]}"

async def detect_from_google_vision(image_bytes: bytes):
    image = vision.Image(content=image_bytes)

    response = await asyncio.get_event_loop().run_in_executor(
        EXECUTOR, lambda: vision_client.label_detection(image=image)
    )

    if response.error.message:
        logger.error(f"Google Vision API error: {response.error.message}")
        raise HTTPException(status_code=500, detail="Google Vision API error")

    threats = []
    for label in response.label_annotations:
        name = label.description.lower()
        if name in ["fire", "smoke", "gun", "knife"]:
            threats.append({"label": name, "confidence": label.score})

    return threats

async def store_anomaly_to_db(event: dict):
    await asyncio.get_running_loop().run_in_executor(
        EXECUTOR, lambda: logger.info(f"Storing event to DB: {event['event_id']}")
    )

# ---------------- Main Endpoint ----------------
@app.post("/detect-anomaly/")
async def process_anomaly(
    camera_id: str = Form(...),
    location: str = Form(...),
    zone_id: str = Form(...),
    threats: Optional[str] = Form(None),  # comma-separated string or JSON string
    image: UploadFile = File(None)
):
    if image is not None:
        logger.info("Image received. Sending to Google Vision for analysis.")
        image_bytes = await image.read()
        threats_with_conf = await detect_from_google_vision(image_bytes)
        threat_labels = [t["label"] for t in threats_with_conf]
    elif threats:
        try:
            if threats.strip().startswith("["):  # assume it's JSON array
                parsed_threats = json.loads(threats)
            else:
                parsed_threats = [t.strip() for t in threats.split(",")]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid threats format")
        threats_with_conf = [{"label": t, "confidence": 0.9} for t in parsed_threats]
        threat_labels = parsed_threats
    else:
        raise HTTPException(status_code=400, detail="No threats or image provided.")

    if not threats_with_conf:
        raise HTTPException(status_code=400, detail="No threats provided or detected.")

    anomaly_event = {
        "event_id": generate_event_id(),
        "status": "threat_detected",
        "threats": threats_with_conf,
        "message": f"Verified Threat(s): {', '.join(threat_labels)}",
        "severity": map_severity(threats_with_conf),
        "dispatch_type": map_dispatch_type(threats_with_conf),
        "safe": False,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "camera_id": camera_id,
        "location": location,
        "zone_id": zone_id,
        "source": "anomaly-agent-v1.2",
        "model_version": "vertex-smoke-v3.1"
    }

    await store_anomaly_to_db(anomaly_event)

    return {"status": "success", "event": anomaly_event}
