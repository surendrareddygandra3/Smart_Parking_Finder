from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import uuid
from app.core.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from fastapi import HTTPException
from jose import jwt, JWTError, ExpiredSignatureError
 
password_handler = CryptContext(schemes=["bcrypt"] , deprecated = "auto")
 
def encrypt_password(password:str)->str:
    return password_handler.hash(password)
 
def verify_password(plain: str, hashed: str) -> bool:
    return password_handler.verify(plain,hashed)

def generate_auth_token(username: str, email: str):
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server misconfigured: missing JWT_SECRET")
    payload = {
        "user": username,
        "email": email,
        "role": "user",
        "type": "access",
        "jti": uuid.uuid4().hex,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


def create_access_token(*, subject: str, email: str, role: str) -> str:
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server misconfigured: missing JWT_SECRET")
    payload = {
        "sub": subject,
        "email": email,
        "role": role,
        "type": "access",
        "jti": uuid.uuid4().hex,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def create_refresh_token(*, subject: str, email: str, role: str) -> tuple[str, dict]:
    """
    Returns (token, claims). Persist claims['jti'] server-side for revoke/rotation.
    """
    if not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server misconfigured: missing JWT_SECRET")
    jti = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": subject,
        "email": email,
        "role": role,
        "type": "refresh",
        "jti": jti,
        "exp": expires_at,
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token, {"jti": jti, "expires_at": expires_at}

def verify_jwt(token:str):
    try:
        decoded = jwt.decode(token,SECRET_KEY,algorithms = ['HS256'])
        user_id = decoded.get("email")
        
        return decoded
    except ExpiredSignatureError:
        raise HTTPException(status_code= 401,
                             detail="Token Expired")
    except JWTError:
        raise HTTPException(status_code= 401,
                             detail="Invalid Token")

 


