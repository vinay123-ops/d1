from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Tuple, List
from datetime import datetime, timedelta
import uuid
import logging

# ---------------- Logging Setup ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("combined-service")
app = FastAPI(title="Central Combiner Service")

# ---------------- In-Memory Store ----------------
temp_store: Dict[Tuple[str, str], Dict[str, dict]] = {}
combine_rate: Dict[Tuple[str, str], List[datetime]] = {}

# ---------------- Schemas ----------------
class AnomalyInput(BaseModel):
    camera_id: str
    location: str
    zone_id: str
    threats: List[Dict[str, float]]  # [{ "label": "fire", "confidence": 0.9 }]
    model_version: str

class BottleneckInput(BaseModel):
    camera_id: str
    location: str
    zone_id: str
    crowd_density: str  # e.g., "low", "medium", "high"
    analyzed_at: str

# ---------------- Helper Functions ----------------
def generate_event_id() -> str:
    return f"combined_{uuid.uuid4().hex[:8]}"

def map_dispatch_type(threats: List[Dict], crowd_density: str) -> str:
    for t in threats:
        if t["label"] in ["fire", "smoke"]:
            return "fire"
    if crowd_density == "high":
        return "medical"
    return "security"

def map_severity(threats: List[Dict]) -> str:
    for t in threats:
        if t["label"] in ["fire", "gun", "knife"] and t["confidence"] >= 0.8:
            return "high"
    for t in threats:
        if t["confidence"] >= 0.5:
            return "medium"
    return "low"

def log_metrics(event: dict):
    logger.info(f"[METRICS] Combined Event Logged: {event['event_id']} | Dispatch: {event['dispatch_type']} | Severity: {event['severity']}")

def is_rate_limited(key: Tuple[str, str]) -> bool:
    now = datetime.utcnow()
    window = combine_rate.setdefault(key, [])
    combine_rate[key] = [t for t in window if now - t < timedelta(minutes=1)]
    if len(combine_rate[key]) >= 5:
        return True
    combine_rate[key].append(now)
    return False

def try_combine(key: Tuple[str, str]) -> Optional[dict]:
    if is_rate_limited(key):
        logger.warning(f"[{key}] Rate limited for combining events")
        return None

    data = temp_store.get(key)
    if data and "anomaly" in data and "bottleneck" in data:
        anomaly = data["anomaly"]
        bottleneck = data["bottleneck"]

        logger.info(f"[{key}] Combining data from anomaly and bottleneck agents")

        threats = anomaly["threats"]
        dispatch_type = map_dispatch_type(threats, bottleneck["crowd_density"])
        severity = map_severity(threats)

        combined_event = {
            "event_id": generate_event_id(),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "camera_id": anomaly["camera_id"],
            "location": anomaly["location"],
            "zone_id": anomaly["zone_id"],
            "model_version": anomaly["model_version"],
            "dispatch_type": dispatch_type,
            "severity": severity,
            "crowd_density": bottleneck["crowd_density"],
            "threats": threats,
            "message": f"Threats: {', '.join(t['label'] for t in threats)} | Crowd: {bottleneck['crowd_density']}",
            "safe": False,
            "source": ["anomaly-agent", "bottleneck-agent"]
        }

        del temp_store[key]
        log_metrics(combined_event)

        # TO DO: Save to database or forward to Dispatch/Summary

        return combined_event

    return None

# ---------------- Routes ----------------
@app.post("/from-anomaly")
def receive_anomaly(data: AnomalyInput):
    key = (data.camera_id, data.zone_id)
    temp_store.setdefault(key, {})["anomaly"] = data.dict()
    logger.info(f"[{key}] Received anomaly input")

    combined = try_combine(key)
    if combined:
        return {"status": "combined", "event": combined}
    return {"status": "anomaly received – waiting for bottleneck or rate-limited"}

@app.post("/from-bottleneck")
def receive_bottleneck(data: BottleneckInput):
    key = (data.camera_id, data.zone_id)
    temp_store.setdefault(key, {})["bottleneck"] = data.dict()
    logger.info(f"[{key}] Received bottleneck input")

    combined = try_combine(key)
    if combined:
        return {"status": "combined", "event": combined}
    return {"status": "bottleneck received – waiting for anomaly or rate-limited"}
