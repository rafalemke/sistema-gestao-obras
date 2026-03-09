"""Endpoints de autenticação."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import Token, LoginForm, UserOut
from app.crud.user import authenticate_user
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=Token)
def login(form: LoginForm, db: Session = Depends(get_db)):
    """Autentica o usuário e retorna o token JWT."""
    user = authenticate_user(db, form.email, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
        )
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado."""
    return current_user
