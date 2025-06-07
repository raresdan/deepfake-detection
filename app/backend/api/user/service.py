from flask import jsonify, request, g
from extensions import supabase

def get_user_name_service(req):
    user_id = req.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    response = supabase.table("users").select("name").eq("id", user_id).single().execute()
    if response.data and "name" in response.data:
        return jsonify({"name": response.data["name"]})
    else:
        return jsonify({"error": "User not found"}), 404

def save_detection_service(req):
    data = req.json
    user_id = g.user_id
    required = ['bucket', 'object_path', 'verdict', 'confidences', 'model']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    results = {
        "verdict": data.get("verdict"),
        "confidences": data.get("confidences"),
        "model": data.get("model"),
    }
    insert_data = {
        "user_id": user_id,
        "bucket": data["bucket"],
        "object_path": data["object_path"],
        "results": results,
        "gradcam_path": data.get("gradcam_path", None),
    }
    response = supabase.table("Images").insert(insert_data).execute()
    if getattr(response, "error", None) is not None or not response.data:
        return jsonify({"error": "Failed to save detection", "details": str(getattr(response, 'error', response.data))}), 500
    image_id = None
    if response.data and isinstance(response.data, list) and len(response.data) > 0:
        image_id = response.data[0].get("id")
    return jsonify({"success": True, "image_id": image_id})
