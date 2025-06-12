from flask import jsonify, g, request
from extensions import supabase

# Dummy history (to be removed if using DB)
history = []

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


def get_user_images_service():
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

def delete_image_service(image_id):
    user_id = g.user_id
    response = supabase.table("Images").delete().eq("id", image_id).eq("user_id", user_id).execute()
    if getattr(response, "error", None) is not None:
        return jsonify({"error": "Failed to delete image", "details": str(getattr(response, 'error', response.data))}), 500
    return jsonify({"success": True})
