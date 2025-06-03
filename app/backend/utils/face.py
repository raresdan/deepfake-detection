import numpy as np
import cv2
from PIL import Image
import io
from huggingface_hub import hf_hub_download
from ultralytics import YOLO
from config import Config

# Download/load model on import
MODEL_PATH = hf_hub_download(repo_id=Config.HUGGINGFACE_FACE_MODEL, filename="model.pt")
yolo_model = YOLO(MODEL_PATH)

def decode_image(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def detect_faces_local(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    output = yolo_model(image)
    faces = []
    for box, score, label in zip(output[0].boxes.xyxy, output[0].boxes.conf, output[0].boxes.cls):
        if score > 0.5 and int(label) == 0:
            faces.append({
                "box": box.tolist(),
                "score": float(score),
                "label": "face"
            })
    return faces, None
