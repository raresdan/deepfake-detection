from flask import Flask
from config import Config
from extensions import cors
from routes import blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    cors.init_app(app)

    # Register all blueprints
    for bp in blueprints:
        app.register_blueprint(bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
