"""Endpoints para gerenciamento de usuários (apenas admin)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.crud.user import create_user, get_user, get_users, update_user, get_user_by_email
from app.core.dependencies import require_admin, require_any_authenticated
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Usuários"])


@router.get("/", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    return get_users(db, skip, limit)


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    return create_user(db, user_in)


@router.get("/{user_id}", response_model=UserOut)
def get_one(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return update_user(db, user, user_in)
