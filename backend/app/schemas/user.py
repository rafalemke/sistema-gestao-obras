"""Schemas Pydantic para usuários e autenticação."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.enums import RoleEnum


class UserBase(BaseModel):
    nome: str
    email: EmailStr
    matricula: Optional[str] = None
    role: RoleEnum = RoleEnum.VISUALIZADOR
    setor: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    matricula: Optional[str] = None
    role: Optional[RoleEnum] = None
    setor: Optional[str] = None
    ativo: Optional[bool] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    ativo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LoginForm(BaseModel):
    email: EmailStr
    password: str
