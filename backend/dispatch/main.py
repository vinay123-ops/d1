from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import uuid
import logging

# ---------------- Logging Setup ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dispatch-service")
app = FastAPI(title="Dispatch Agent Service")

# ---------------- Event Schema ----------------
class Threat(BaseModel):
    label: str
    confidence: float

class CombinedEvent(BaseModel):
    event_id: str
    timestamp: str
    camera_id: str
    location: str
    zone_id: str
    model_version: str
    dispatch_type: str  # fire / security / medical
    severity: str       # high / medium / low
    crowd_density: str
    threats: List[Threat]
    message: str
    safe: bool
    source: List[str]

# ---------------- Dispatch Logic ----------------
def act_on_event(event: CombinedEvent):
    logger.info(f"[ACTION] Dispatching → {event.dispatch_type.upper()} team")
    logger.info(f"[DETAILS] Severity: {event.severity} | Location: {event.location} | Threats: {', '.join(t.label for t in event.threats)}")

    # Example actions (placeholders for now):
    if event.dispatch_type == "fire":
        logger.info("[🚒] Notifying fire department")
    elif event.dispatch_type == "medical":
        logger.info("[🚑] Notifying medical response team")
    elif event.dispatch_type == "security":
        logger.info("[👮] Notifying security personnel")

    # TODO: Integrate with SMS, webhook, WhatsApp, Firebase, etc.

# ---------------- API Endpoint ----------------
@app.post("/dispatch-event/")
def dispatch_event(event: CombinedEvent):
    logger.info(f"[RECEIVED] Combined event from: {event.source}")
    logger.info(f"[{event.event_id}] Severity: {event.severity} | Dispatch: {event.dispatch_type}")
    act_on_event(event)
    return {"status": "dispatched", "event_id": event.event_id}
