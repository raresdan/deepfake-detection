from flask_cors import CORS
from supabase import create_client
from config import Config


cors = CORS()
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
