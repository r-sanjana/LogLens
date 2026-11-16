
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings


# Initialize Argon2 password hashing
password_hash = PasswordHash.recommended()


# Hash user password
def hash_password(password: str) -> str:
    return password_hash.hash(password)


# Verify user password
def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password
    )


# Generate JWT access token
def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None
) -> str:

    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": subject,
        "exp": expire
    }

    encoded_token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_token
