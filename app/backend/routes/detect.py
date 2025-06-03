from flask import Blueprint, request, jsonify
from utils.face import decode_image, detect_faces_local
from utils.deepfake import run_deepfake_model

bp = Blueprint("detect", __name__, url_prefix="/api")

@bp.route('/validate-face', methods=['POST'])
def validate_face():
    if 'image' not in request.files:
        return jsonify({"valid": False, "error": "No image uploaded"}), 400
    file_bytes = request.files['image'].read()
    if not file_bytes:
        return jsonify({"valid": False, "error": "Empty file"}), 400
    faces, error = detect_faces_local(file_bytes)
    return jsonify({"valid": bool(faces)})


@bp.route('/detect', methods=['POST'])
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
    heatmap = None
    return jsonify({
        "verdict": verdict,
        "confidences": confidences,
        "heatmap": heatmap
    })
