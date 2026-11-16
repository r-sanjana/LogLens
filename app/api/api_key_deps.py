
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import APIKey
from app.core.api_key_security import hash_api_key


api_key_header = APIKeyHeader(
    name="X-API-Key",
    auto_error=False
)


def get_application_api_key(
    api_key: str = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required"
        )

    hashed_key = hash_api_key(api_key)

    stored_key = db.query(APIKey).filter(
        APIKey.key_hash == hashed_key,
        APIKey.is_active == True
    ).first()

    if not stored_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key"
        )

    return stored_key
