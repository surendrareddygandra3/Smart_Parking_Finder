from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI, MONGO_DB_NAME
 
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB_NAME]
user_collection = db["users"]
admin_collection = db["admins"]
login_sessions_collection = db["login_sessions"]
token_blacklist_collection = db["token_blacklist"]
refresh_tokens_collection = db["refresh_tokens"]
parkings_collection = db["parking_lots"]
slots_collection = db["slots"]
bookings_collection = db["bookings"]
notifications_collection = db["notifications"]
payments_collection = db["payments"]
vehicles_collection = db["vehicles"]
favorites_collection = db["favorites"]
reviews_collection = db["reviews"]
