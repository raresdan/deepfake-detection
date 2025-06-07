from flask import Blueprint, request
from utils.auth import require_auth
from .service import (
    save_detection_service,
    get_user_images_service,
)

bp = Blueprint("history", __name__, url_prefix="/api/history")

@bp.route('/save-detection', methods=['POST'])
@require_auth
def save_detection():
    return save_detection_service(request)

@bp.route('/images', methods=['GET'])
@require_auth
def get_user_images():
    return get_user_images_service()
