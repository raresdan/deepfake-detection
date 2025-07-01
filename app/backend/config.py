import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    JWT_SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET", "")
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACE_API_TOKEN", "")
    HUGGINGFACE_FACE_MODEL: str = "arnabdhar/YOLOv8-Face-Detection"