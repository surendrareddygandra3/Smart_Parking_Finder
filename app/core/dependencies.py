from datetime import datetime, timedelta

from fastapi import HTTPException

from app.core.security import verify_jwt
from app.db.mongo_db import token_blacklist_collection, login_sessions_collection
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def store_session(email: str, username: str, token: str):
    # One active session per email (simple production default)
    await login_sessions_collection.delete_many({"email": email})
    await login_sessions_collection.insert_one(
        {
            "email": email,
            "username": username,
            "token": token,
            "created_at": datetime.utcnow(),
            "status": "Active",
        }
    )
    logger.info("Session created for %s", email)


async def remove_session(token: str):
    session = await login_sessions_collection.find_one({"token": token})
    if not session:
        return "No active session"

    await login_sessions_collection.delete_one({"token": token})
    await token_blacklist_collection.insert_one({"token": token, "created_at": datetime.utcnow()})
    return "Logout successful"


async def validate_token(token: str) -> dict:
    """
    Production-simple auth: valid JWT + not blacklisted.
    Session collection is used for logout bookkeeping only.
    """
    try:
        payload = verify_jwt(token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token: no email")

    if await token_blacklist_collection.find_one({"token": token}):
        raise HTTPException(status_code=403, detail="Token revoked")

    # Normalize role for RBAC
    if "role" not in payload:
        payload["role"] = "user"

    return payload
