from fastapi import Header, HTTPException

from app.core.dependencies import validate_token


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    return authorization.replace("Bearer ", "", 1).strip()


async def get_auth_context(authorization: str = Header(...)) -> dict:
    """
    Standard auth dependency for protected routes.
    Returns {token, payload} after session + blacklist checks.
    """
    token = _extract_bearer_token(authorization)
    payload = await validate_token(token)
    return {"token": token, "payload": payload}


async def get_current_user_payload(authorization: str = Header(...)) -> dict:
    ctx = await get_auth_context(authorization)
    return ctx["payload"]


async def get_current_token(authorization: str = Header(...)) -> str:
    return _extract_bearer_token(authorization)

