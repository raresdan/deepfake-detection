from flask import Blueprint, request
from utils.auth import require_auth
from .service import (
    validate_face_service,
    detect_service,
    get_models_service,
)

bp = Blueprint("detect", __name__, url_prefix="/api")

@bp.route('/validate-face', methods=['POST'])
def validate_face():
    return validate_face_service(request)

@bp.route('/detect', methods=['POST'])
@require_auth
def detect():
    return detect_service(request)

@bp.route('/models', methods=['GET'])
def get_models():
    return get_models_service()
