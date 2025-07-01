from flask import request, jsonify, g
from functools import wraps
from extensions import supabase

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if supabase is None:
            return jsonify({"error": "Supabase client not initialized"}), 500

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            return jsonify({"error": "Invalid or expired token"}), 401
        g.user_id = user_resp.user.id
        return f(*args, **kwargs)
    return decorated
