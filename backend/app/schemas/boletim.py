"""Schemas Pydantic para Boletins de Medição."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.models.enums import BMStatusEnum, FonteVerbaEnum
from app.schemas.user import UserOut


class BMBase(BaseModel):
    numero_bm: int
    numero_sei: Optional[str] = None
    periodo_inicio: Optional[date] = None
    periodo_fim: Optional[date] = None
    data_emissao: Optional[date] = None
    valor: Optional[Decimal] = None
    fonte_verba: Optional[FonteVerbaEnum] = None
    observacao: Optional[str] = None


class BMCreate(BMBase):
    obra_id: int


class BMUpdate(BaseModel):
    numero_sei: Optional[str] = None
    periodo_inicio: Optional[date] = None
    periodo_fim: Optional[date] = None
    data_emissao: Optional[date] = None
    valor: Optional[Decimal] = None
    fonte_verba: Optional[FonteVerbaEnum] = None
    observacao: Optional[str] = None


class BMStatusUpdate(BaseModel):
    status: BMStatusEnum
    observacao: Optional[str] = None


class BMStatusHistoryOut(BaseModel):
    id: int
    status_anterior: Optional[BMStatusEnum]
    status_novo: BMStatusEnum
    observacao: Optional[str]
    created_at: datetime
    usuario: Optional[UserOut]

    class Config:
        from_attributes = True


class BMOut(BMBase):
    id: int
    obra_id: int
    status: BMStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BMDetail(BMOut):
    status_history: List[BMStatusHistoryOut] = []
