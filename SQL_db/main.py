from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import uuid

# ---------------- Database Config ----------------
DATABASE_URL = "postgresql://postgres@127.0.0.1:5432/drishti_db"
print(f"[INFO] Connecting to database at {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
    print("[INFO] SQLAlchemy engine and session created successfully.")
except Exception as e:
    print(f"[ERROR] Failed to initialize SQLAlchemy engine: {e}")

def get_db():
    print("[DEBUG] Opening DB session...")
    db = SessionLocal()
    try:
        yield db
    finally:
        print("[DEBUG] Closing DB session...")
        db.close()

# ---------------- SQLAlchemy Model ----------------
class Event(Base):
    __tablename__ = "events"

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False)

# ---------------- Pydantic Schema ----------------
class EventCreate(BaseModel):
    title: str
    location: str
    timestamp: datetime

# ---------------- FastAPI App ----------------
app = FastAPI()

# Create DB tables at startup
@app.on_event("startup")
def startup():
    print("[INFO] Starting up application...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[INFO] Database tables created (if not exist).")
    except Exception as e:
        print(f"[ERROR] Failed to create tables: {e}")

@app.post("/events/")
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    print(f"[INFO] Received request to create event: {event}")
    try:
        db_event = Event(**event.dict())
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        print(f"[INFO] Event created successfully: {db_event.event_id}")
        return db_event
    except Exception as e:
        print(f"[ERROR] Failed to create event: {e}")
        raise HTTPException(status_code=500, detail="Error creating event")

@app.get("/events/")
def read_events(db: Session = Depends(get_db)):
    print("[INFO] Fetching all events from database...")
    try:
        events = db.query(Event).all()
        print(f"[INFO] Retrieved {len(events)} events.")
        return events
    except Exception as e:
        print(f"[ERROR] Failed to fetch events: {e}")
        raise HTTPException(status_code=500, detail="Error fetching events")
