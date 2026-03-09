"""
Dependências FastAPI para autenticação e controle de acesso por perfil (RBAC).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.enums import RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.ativo == True).first()
    if user is None:
        raise credentials_exception
    return user


def require_roles(*roles: RoleEnum):
    """Factory que retorna uma dependência exigindo um dos perfis listados."""
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para esta ação.",
            )
        return current_user
    return checker


# Atalhos prontos para uso nos endpoints
require_admin = require_roles(RoleEnum.ADMIN)
require_gestor_or_above = require_roles(RoleEnum.ADMIN, RoleEnum.GESTOR)
require_fiscal_or_above = require_roles(RoleEnum.ADMIN, RoleEnum.GESTOR, RoleEnum.FISCAL)
require_any_authenticated = require_roles(
    RoleEnum.ADMIN, RoleEnum.GESTOR, RoleEnum.FISCAL, RoleEnum.VISUALIZADOR
)
