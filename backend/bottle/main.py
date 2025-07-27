from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import torch, cv2, sys, os, json
from pathlib import Path
from collections import Counter
import logging

app = FastAPI()
logger = logging.getLogger("bottleneck-agent")

# Setup model once at startup
YOLOV5_DIR = Path('./yolov5')
MODEL_PATH = Path('models/yolov5s.pt')
sys.path.insert(0, str(YOLOV5_DIR.resolve()))
model = torch.hub.load('.', 'custom', path=str(MODEL_PATH), source='local')
model.eval()

@app.post("/analyze-density/")
async def analyze_density(
    camera_id: str = Form(...),
    zone_id: str = Form(...),
    location: str = Form(...),
    image: UploadFile = File(...)
):
    img_bytes = await image.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img)
    predictions = results.pandas().xyxy[0]
    labels = predictions['name'].tolist()
    label_counts = dict(Counter(labels))
    crowd_count = label_counts.get('person', 0)

    response = {
        "camera_id": camera_id,
        "zone_id": zone_id,
        "location": location,
        "crowd_density": crowd_count,
        "object_breakdown": label_counts,
        "model_used": str(MODEL_PATH.name)
    }
    return JSONResponse(content=response)
