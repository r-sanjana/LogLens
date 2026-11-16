
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.application import Application
from app.models.api_key import APIKey
from app.schemas.api_key import (
    APIKeyCreate,
    APIKeyResponse,
    APIKeyCreated
)
from app.core.api_key_security import (
    generate_api_key,
    hash_api_key,
    get_key_prefix
)

router = APIRouter(
    prefix="/applications/{application_id}/api-keys",
    tags=["API Keys"]
)


def get_owned_application(
    application_id: int,
    current_user: User,
    db: Session
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application


# CREATE API KEY
@router.post(
    "/",
    response_model=APIKeyCreated,
    status_code=status.HTTP_201_CREATED
)
def create_api_key(
    application_id: int,
    key_data: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_owned_application(application_id, current_user, db)

    raw_key = generate_api_key()

    new_key = APIKey(
        application_id=application_id,
        name=key_data.name.strip(),
        key_prefix=get_key_prefix(raw_key),
        key_hash=hash_api_key(raw_key)
    )

    db.add(new_key)
    db.commit()
    db.refresh(new_key)

    return {
        "id": new_key.id,
        "application_id": new_key.application_id,
        "name": new_key.name,
        "key_prefix": new_key.key_prefix,
        "is_active": new_key.is_active,
        "created_at": new_key.created_at,
        "last_used_at": new_key.last_used_at,
        "api_key": raw_key
    }


# LIST API KEYS
@router.get("/", response_model=list[APIKeyResponse])
def list_api_keys(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_owned_application(application_id, current_user, db)

    return db.query(APIKey).filter(
        APIKey.application_id == application_id
    ).order_by(APIKey.id.desc()).all()


# REVOKE API KEY
@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    application_id: int,
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_owned_application(application_id, current_user, db)

    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.application_id == application_id
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=404,
            detail="API key not found"
        )

    api_key.is_active = False
    db.commit()

    return None
