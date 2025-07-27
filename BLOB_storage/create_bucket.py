# create_bucket.py
from google.cloud import storage
from google.api_core.exceptions import Conflict, GoogleAPIError
from config import BUCKET_NAME, LOCATION

def create_bucket(bucket_name: str, location: str = "ASIA-SOUTH1"):
    """Creates a new GCS bucket in the specified location."""
    try:
        storage_client = storage.Client()

        # Check if bucket already exists
        bucket = storage_client.lookup_bucket(bucket_name)
        if bucket:
            print(f"⚠️ Bucket '{bucket_name}' already exists.")
            return

        # Create the bucket
        new_bucket = storage_client.create_bucket(bucket_name, location=location)
        print(f"✅ Bucket '{new_bucket.name}' created in location '{location}'.")

    except Conflict:
        print(f"⚠️ Conflict: Bucket '{bucket_name}' already exists.")
    except GoogleAPIError as e:
        print(f"❌ Error creating bucket: {e}")

if __name__ == "__main__":
    create_bucket(BUCKET_NAME, LOCATION)
