from flask import Blueprint, request
from utils.auth import require_auth
from .service import (
    get_user_name_service,
    save_detection_service,
)

bp = Blueprint("user", __name__, url_prefix="/api/user")

@bp.route('/name', methods=['GET'])
def get_user_name():
    return get_user_name_service(request)

@bp.route('/save-detection', methods=['POST'])
@require_auth
def save_detection():
    return save_detection_service(request)
