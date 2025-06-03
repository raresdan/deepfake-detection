from flask import Blueprint, jsonify

bp = Blueprint("models", __name__, url_prefix="/api")

AVAILABLE_MODELS = [
    {"id": "xception", "name": "Xception"},
    {"id": "resnet", "name": "ResNet"},
    {"id": "efficientnet", "name": "EfficientNet"}
]

@bp.route('/models', methods=['GET'])
def get_models():
    return jsonify({"models": AVAILABLE_MODELS})
