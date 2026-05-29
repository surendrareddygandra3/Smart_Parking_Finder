from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException
from jose import jwt, JWTError, ExpiredSignatureError

from app.core.config import SECRET_KEY
from app.core.security import encrypt_password, verify_password, create_access_token, create_refresh_token
from app.db.mongo_db import user_collection, admin_collection, refresh_tokens_collection, login_sessions_collection


async def _find_principal_by_identifier(identifier: str) -> tuple[dict | None, str]:
    """
    Returns (principal_doc, role). role is 'user' or 'admin'.
    """
    user = await user_collection.find_one({"$or": [{"email": identifier}, {"username": identifier}]})
    if user:
        return user, "user"
    admin = await admin_collection.find_one({"$or": [{"email": identifier}, {"username": identifier}]})
    if admin:
        return admin, "admin"
    return None, "user"


async def register_admin(username: str, email: str, password: str) -> dict:
    exists = await admin_collection.find_one({"$or": [{"email": email}, {"username": username}]})
    if exists:
        raise HTTPException(status_code=400, detail="Admin already exists")
    now = datetime.now(timezone.utc)
    doc = {
        "username": username,
        "email": email,
        "password": encrypt_password(password),
        "role": "admin",
        "status": "Active",
        "created_at": now,
        "updated_at": now,
    }
    await admin_collection.insert_one(doc)
    return {"message": "Admin registered successfully"}


async def login(identifier: str, password: str) -> dict:
    principal, role = await _find_principal_by_identifier(identifier)
    if not principal:
        raise HTTPException(status_code=404, detail="Account not found")
    if principal.get("status") not in (None, "Active"):
        raise HTTPException(status_code=403, detail="Account disabled")
    if not verify_password(password, principal["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    subject = str(principal.get("_id"))
    email = principal["email"]

    access_token = create_access_token(subject=subject, email=email, role=role)
    refresh_token, refresh_claims = create_refresh_token(subject=subject, email=email, role=role)

    # Persist refresh token jti for rotation/revoke
    await refresh_tokens_collection.insert_one(
        {
            "jti": refresh_claims["jti"],
            "sub": subject,
            "email": email,
            "role": role,
            "revoked_at": None,
            "created_at": datetime.now(timezone.utc),
            "expires_at": refresh_claims["expires_at"],
        }
    )

    from app.core.dependencies import store_session

    await store_session(email, principal.get("username", ""), access_token)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


async def refresh(refresh_token: str) -> dict:
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server misconfigured: missing JWT_SECRET")
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    jti = payload.get("jti")
    email = payload.get("email")
    role = payload.get("role", "user")
    sub = payload.get("sub")
    if not jti or not email or not sub:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_doc = await refresh_tokens_collection.find_one({"jti": jti})
    if not token_doc or token_doc.get("revoked_at") is not None:
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    # Rotate: revoke old, issue new pair
    await refresh_tokens_collection.update_one({"jti": jti}, {"$set": {"revoked_at": datetime.now(timezone.utc)}})

    access_token = create_access_token(subject=sub, email=email, role=role)
    new_refresh_token, refresh_claims = create_refresh_token(subject=sub, email=email, role=role)
    await refresh_tokens_collection.insert_one(
        {
            "jti": refresh_claims["jti"],
            "sub": sub,
            "email": email,
            "role": role,
            "revoked_at": None,
            "created_at": datetime.now(timezone.utc),
            "expires_at": refresh_claims["expires_at"],
        }
    )

    from app.core.dependencies import store_session

    await store_session(email, "", access_token)

    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

