from pydantic import BaseModel, EmailStr


class AuthRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class AuthLoginRequest(BaseModel):
    identifier: str  # email or username
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthMeResponse(BaseModel):
    email: EmailStr
    role: str
    sub: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str

