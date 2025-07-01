from flask import Flask
from config import Config
from extensions import cors
from api.detect import bp as detect_bp
from api.history import bp as history_bp
from utils.download_models import download_and_extract_models


def register_blueprints(app):
    app.register_blueprint(detect_bp)
    app.register_blueprint(history_bp)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    cors.init_app(app)
    register_blueprints(app)

    return app

if __name__ == '__main__':
    download_and_extract_models()
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)

app = create_app()