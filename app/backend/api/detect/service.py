import os
import uuid
import base64
from utils.face import decode_image, detect_faces_local
from utils.deepfake import run_deepfake_model
from models_architectures.efficient_net import load_efficientnet_multiclass
from supabase import create_client, Client
from flask import jsonify, request

# --- Model Loading (at startup) ---
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODELS_DIR = os.path.abspath(MODELS_DIR)

AVAILABLE_MODELS = [
    {
        "value": "xception",
        "label": "XceptionNet",
        "desc": "Slower but more accurate predictions",
        # "func": load_xception,
        "target_layer": lambda model: model.block[-1],
    },
    {
        "value": "resnet",
        "label": "ResNet",
        "desc": "Fast, good for real-time",
        # "func": load_resnet,
        "target_layer": lambda model: model.layer4[-1],
    },
    {
        "value": "efficientnet_multiclass",
        "label": "EfficientNet",
        "desc": "Balanced speed and accuracy",
        "func": load_efficientnet_multiclass,
        "target_layer": lambda model: model.backbone.blocks[-1],
    }
]

MODELS = {}
for model in AVAILABLE_MODELS:
    model_id = model["value"]
    if "func" in model:
        print(f"Loading model: {model_id}")
        MODELS[model_id] = model["func"]()
    else:
        print(f"WARNING: Loader function for '{model_id}' not defined")

class_to_label = {
    "class_0": "Real",
    "class_1": "Stable Diffusion XL",
    "class_2": "StyleGAN1",
    "class_3": "StyleGAN2",
    "class_4": "StyleGAN3",
    "class_5": "thispersondoesnotexist"
}

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def validate_face_service(req):
    if 'image' not in req.files:
        return jsonify({"valid": False, "error": "No image uploaded"}), 400
    file_bytes = req.files['image'].read()
    if not file_bytes:
        return jsonify({"valid": False, "error": "Empty file"}), 400
    faces, error = detect_faces_local(file_bytes)
    return jsonify({"valid": bool(faces)})


def get_gradcam_layer(model_id, model):
    for m in AVAILABLE_MODELS:
        if m["value"] == model_id and "target_layer" in m:
            return m["target_layer"](model)
    return None


def detect_service(req):
    if 'image' not in req.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = req.files['image']
    model_id = req.form.get('model', 'xception')
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

    model = MODELS.get(model_id)
    if model is None:
        return jsonify({"error": f"Model '{model_id}' not available."}), 400

    gradcam_requested = req.form.get("gradcam", "false").lower() == "true"
    gradcam_layer = None
    gradcam_url = None
    if gradcam_requested:
        gradcam_layer = get_gradcam_layer(model_id, model)
        verdict, top3, gradcam_b64 = run_deepfake_model(
            img, faces, model=model, return_gradcam=True, gradcam_layer=gradcam_layer
        )
        gradcam_bytes = base64.b64decode(gradcam_b64)
        gradcam_filename = f"gradcam_{uuid.uuid4().hex}.png"
        supabase.storage.from_("gallery").upload(gradcam_filename, gradcam_bytes, {"content-type": "image/png"})
        gradcam_url = supabase.storage.from_("gallery").get_public_url(gradcam_filename)
    else:
        verdict, top3 = run_deepfake_model(img, faces, model=model)

    translated_top3 = [
        {"label": class_to_label.get(cls, cls), "score": float(score)}
        for cls, score in top3
    ]

    response = {
        "verdict": verdict,
        "confidences": translated_top3
    }
    if gradcam_requested and gradcam_url:
        response["grad_cam_url"] = gradcam_url

    print(f"Model: {model_id}, Verdict: {verdict}, Top 3: {translated_top3}, Grad-CAM URL: {gradcam_url}")
    return jsonify(response)


def get_models_service():
    models_no_func = [
        {k: v for k, v in model.items() if k != "func" and k != "target_layer"}
        for model in AVAILABLE_MODELS
    ]
    return jsonify({"models": models_no_func})
