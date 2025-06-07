from flask import Blueprint, request
from utils.auth import require_auth
from .service import (
    save_to_history_service,
    get_user_images_service,
)

bp = Blueprint("history", __name__, url_prefix="/api/history")

@bp.route('/save', methods=['POST'])
def save_to_history():
    return save_to_history_service(request)

@bp.route('/images', methods=['GET'])
@require_auth
def get_user_images():
    return get_user_images_service()
