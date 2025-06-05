from flask import Blueprint, request, jsonify, g
from utils.auth import require_auth
from extensions import supabase

bp = Blueprint("history", __name__, url_prefix="/api/history")

# Dummy history (move to DB in prod)
history = []


@bp.route('/save', methods=['POST'])
def save_to_history():
    data = request.json
    if not data or "image_id" not in data or "verdict" not in data:
        return jsonify({"error": "Missing data"}), 400
    history.append(data)
    return jsonify({"success": True})


@bp.route('/images', methods=['GET'])
@require_auth
def get_user_images():
    user_id = g.user_id
    response = supabase.table("Images").select("*").eq("user_id", user_id).execute()
    if getattr(response, "error", None) is not None:
        return jsonify({"error": "Failed to fetch images", "details": str(getattr(response, 'error', response.data))}), 500
    images = response.data if response.data else []

    # Generate public URLs for each image
    for img in images:
        bucket = img.get("bucket")
        object_path = img.get("object_path")
        gradcam_path = img.get("gradcam_path")
        if bucket and object_path:
            img["imageUrl"] = supabase.storage.from_(bucket).get_public_url(object_path)
        else:
            img["imageUrl"] = ""
        if bucket and gradcam_path:
            img["gradcamUrl"] = supabase.storage.from_(bucket).get_public_url(gradcam_path)
        else:
            img["gradcamUrl"] = ""

    return jsonify({"images": images})