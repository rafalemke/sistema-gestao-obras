"""
Modelo de usuário com perfil de acesso (RBAC).
"""
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, func
from app.db.session import Base
from app.models.enums import RoleEnum


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    matricula = Column(String(30), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.VISUALIZADOR)
    setor = Column(String(100), nullable=True)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
