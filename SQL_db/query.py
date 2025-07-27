import uuid
from datetime import datetime

from sqlalchemy import (
    Column, Text, Boolean, Float, ForeignKey, TIMESTAMP, create_engine
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

# Base model
Base = declarative_base()

# === Table 1: Events ===
class Event(Base):
    __tablename__ = "events"

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(Text)
    zone = Column(Text)
    location = Column(Text)
    severity = Column(Text)
    threat_level = Column(Text)
    timestamp = Column(TIMESTAMP)
    details_json = Column(JSONB)
    summary_id = Column(UUID(as_uuid=True), ForeignKey("summaries.summary_id"), nullable=True)

    summary = relationship("Summary", back_populates="event", uselist=False, foreign_keys=[summary_id])
    images = relationship("Image", back_populates="event")


# === Table 2: Summaries ===
class Summary(Base):
    __tablename__ = "summaries"

    summary_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    summary_text = Column(Text)
    generated_at = Column(TIMESTAMP)
    model_used = Column(Text)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.event_id"))

    event = relationship("Event", back_populates="summary", foreign_keys=[event_id])


# === Table 3: Images ===
class Image(Base):
    __tablename__ = "images"

    image_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.event_id"))
    blob_url = Column(Text)
    timestamp = Column(TIMESTAMP)
    camera_id = Column(Text)
    motion_score = Column(Float)
    is_anomaly_frame = Column(Boolean)

    event = relationship("Event", back_populates="images")


# === Table 4: Cameras ===
class Camera(Base):
    __tablename__ = "cameras"

    camera_id = Column(Text, primary_key=True)
    zone_id = Column(Text)
    location_meta = Column(JSONB)
    active = Column(Boolean)

# === Engine and Session Setup ===
DATABASE_URL = "postgresql://username:password@localhost:5432/drishti_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)



#sample data from on how to feed: 
def insert_sample_data():
    session = SessionLocal()

    try:
        # 1. Insert Camera
        camera = Camera(
            camera_id="CAM001",
            zone_id="ZoneA",
            location_meta={"lat": 28.6139, "lon": 77.2090, "description": "Main Gate"},
            active=True
        )
        session.add(camera)

        # 2. Insert Event
        event = Event(
            event_type="fire",
            zone="ZoneA",
            location="Main Gate",
            severity="high",
            threat_level="critical",
            timestamp=datetime.utcnow(),
            details_json={"source": "anomaly-agent", "confidence": 0.96}
        )
        session.add(event)
        session.flush()  # to generate event_id

        # 3. Insert Image
        image = Image(
            event_id=event.event_id,
            blob_url="https://storage.googleapis.com/drishti-bucket/fire1.jpg",
            timestamp=datetime.utcnow(),
            camera_id="CAM001",
            motion_score=0.87,
            is_anomaly_frame=True
        )
        session.add(image)

        # 4. Insert Summary
        summary = Summary(
            summary_text="Fire detected at Main Gate, ZoneA. Severity high. Immediate action needed.",
            generated_at=datetime.utcnow(),
            model_used="Gemini-1.5",
            event_id=event.event_id
        )
        session.add(summary)
        session.flush()

        # Link summary_id back to event
        event.summary_id = summary.summary_id

        session.commit()
        print("✅ Sample data inserted successfully.")

    except Exception as e:
        session.rollback()
        print(f"❌ Error inserting sample data: {e}")
    finally:
        session.close()


# Step 1: Create the tables
init_db()

# Step 2: Insert sample records
insert_sample_data()