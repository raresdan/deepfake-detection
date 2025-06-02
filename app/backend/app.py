from flask import Flask, request, jsonify, send_file
import cv2
import numpy as np
from flask_cors import CORS
import os
import requests
from huggingface_hub import hf_hub_download
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)


HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HUGGINGFACE_FACE_MODEL = "arnabdhar/YOLOv8-Face-Detection"

# Download and load the model once at startup
MODEL_PATH = hf_hub_download(repo_id="arnabdhar/YOLOv8-Face-Detection", filename="model.pt")
yolo_model = YOLO(MODEL_PATH)


def decode_image(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def detect_faces_local(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    output = yolo_model(image)
    # Each detection is in output[0].boxes
    faces = []
    for box, score, label in zip(output[0].boxes.xyxy, output[0].boxes.conf, output[0].boxes.cls):
        if score > 0.5 and int(label) == 0:  # 0 is usually 'face' for face models
            faces.append({
                "box": box.tolist(),
                "score": float(score),
                "label": "face"
            })
    return faces, None

def run_deepfake_model(img, faces):
    # Placeholder for your real model logic
    return "fake", {"xception": 0.92, "resnet": 0.85, "efficientnet": 0.88}

# Dummy gallery storage (replace with DB in production)
gallery = []

AVAILABLE_MODELS = [
    {"id": "xception", "name": "Xception"},
    {"id": "resnet", "name": "ResNet"},
    {"id": "efficientnet", "name": "EfficientNet"}
]

@app.route('/api/validate-face', methods=['POST'])
def validate_face():
    if 'image' not in request.files:
        return jsonify({"valid": False, "error": "No image uploaded"}), 400
    file = request.files['image']
    file_bytes = file.read()
    if not file_bytes:
        return jsonify({"valid": False, "error": "Empty file"}), 400
    faces, error = detect_faces_local(file_bytes)
    return jsonify({"valid": bool(faces)})

@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify({"models": AVAILABLE_MODELS})

@app.route('/api/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files['image']
    model_id = request.form.get('model', 'xception')
    file_bytes = file.read()
    if not file_bytes:
        return jsonify({"error": "Empty file"}), 400
    img = decode_image(file_bytes)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400
    faces, error = detect_faces_local(file_bytes)
    if error is not None:
        return jsonify({"error": "Face detection API error", "details": error}), 502
    if not faces:
        return jsonify({"error": "No face detected"}), 200
    verdict, confidences = run_deepfake_model(img, faces)
    # Dummy heatmap (replace with real logic)
    heatmap = None
    return jsonify({
        "verdict": verdict,
        "confidences": confidences,
        "heatmap": heatmap
    })

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    return jsonify({"gallery": gallery})

@app.route('/api/gallery/save', methods=['POST'])
def save_to_gallery():
    data = request.json
    # Expecting: { "image_id": ..., "verdict": ..., "confidences": ... }
    if not data or "image_id" not in data or "verdict" not in data:
        return jsonify({"error": "Missing data"}), 400
    gallery.append(data)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)