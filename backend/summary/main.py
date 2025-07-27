from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import concurrent.futures
import atexit
import asyncio
import os
from pydantic import BaseModel
from datetime import datetime
import uuid
import logging
import time
import random

import google.generativeai as genai

from sqlalchemy import create_engine, Column, String, Text, JSON, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ---------------- Logging Setup ----------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("summary-agent")

# ---------------- FastAPI App ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Summary Agent", lifespan=lifespan)

# ---------------- Thread Executor ----------------
EXECUTOR = concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count() or 4)
atexit.register(EXECUTOR.shutdown, wait=False)

# ---------------- Retry Config ----------------
MAX_RETRIES = 3
BASE_DELAY = 1.0

# ---------------- Gemini API Setup ----------------
GEMINI_API_KEY = "AIzaSyC--Ac9zAttGfAcgYrAV1M5eK1OVHIP5Kc"
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ---------------- DB Config ----------------
DB_USER = "postgres"
DB_PASS = "yourpassword"
DB_NAME = "drishti_db"
DB_HOST = "localhost"
DB_PORT = "5432"

DB_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

class Summary(Base):
    __tablename__ = "summaries"
    summary_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    summary = Column(Text, nullable=False)
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False)
    event = Column(JSON, nullable=False)

Base.metadata.create_all(bind=engine)

# ---------------- Utils ----------------
def current_utc_timestamp():
    return datetime.utcnow().isoformat() + "Z"

# ---------------- Pydantic Schema ----------------
class CombinedEvent(BaseModel):
    eventId: str
    type: str
    severity: str
    location: str
    timestamp: str
    details: str
    threat_level: str
    threat_type: str

# ---------------- Retry Decorator ----------------
def retry_with_backoff(max_retries=MAX_RETRIES, base_delay=BASE_DELAY, jitter=True):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    delay = base_delay * (2 ** (attempt - 1))
                    if jitter:
                        delay += random.uniform(0, 0.5)
                    logger.warning(f"[Attempt {attempt}] {func.__name__} failed: {e}. Retrying in {delay:.2f}s...")
                    time.sleep(delay)
            raise Exception(f"{func.__name__} failed after {max_retries} retries.")
        return wrapper
    return decorator

# ---------------- Summary Logic ----------------
@retry_with_backoff()
def generate_summary(event: CombinedEvent) -> str:
    prompt = (
        f"Generate a concise summary of a safety incident:\n"
        f"- Threat Type: {event.threat_type}\n"
        f"- Threat Level: {event.threat_level}\n"
        f"- Event Type: {event.type}\n"
        f"- Severity: {event.severity}\n"
        f"- Location: {event.location}\n"
        f"- Timestamp: {event.timestamp}\n"
        f"- Additional Details: {event.details}\n\n"
        f"Summarize in 2-3 sentences suitable for emergency response logs."
    )
    logger.info("Calling Gemini API for summary generation...")
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

@retry_with_backoff()
def save_summary_to_db(summary_obj: dict):
    logger.info("Saving summary to database...")
    db = SessionLocal()
    try:
        summary_entry = Summary(
            summary_id=uuid.UUID(summary_obj["summary_id"]),
            summary=summary_obj["summary"],
            timestamp=summary_obj["timestamp"],
            event=summary_obj["event"]
        )
        db.add(summary_entry)
        db.commit()
        db.refresh(summary_entry)
        logger.info("Summary saved successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"DB error: {e}")
        raise
    finally:
        db.close()

# ---------------- Async Wrappers ----------------
async def _sync_generate_summary(event: CombinedEvent) -> str:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(EXECUTOR, lambda: generate_summary(event))

async def _sync_save_summary_to_db(summary_obj: dict):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(EXECUTOR, lambda: save_summary_to_db(summary_obj))

# ---------------- Routes ----------------
@app.post("/generate-summary")
async def summarize_event(event: CombinedEvent):
    try:
        logger.info(f"[RECEIVED] Event: {event.eventId} for summarization")
        summary_text = await _sync_generate_summary(event)

        summary_obj = {
            "summary_id": str(uuid.uuid4()),
            "summary": summary_text,
            "timestamp": current_utc_timestamp(),
            "event": event.dict()
        }

        try:
            await _sync_save_summary_to_db(summary_obj)
        except Exception as db_err:
            logger.error(f"DB write failed: {db_err}. Logging locally.")

        logger.info(f"[SUMMARY GENERATED] {summary_text}")
        return summary_obj

    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(status_code=500, detail={
            "error": "Summary generation failed after retries",
            "reason": str(e),
            "timestamp": current_utc_timestamp()
        })

@app.get("/health")
def health_check():
    return {"status": "summary agent healthy"}
