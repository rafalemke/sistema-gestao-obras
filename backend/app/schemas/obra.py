"""Schemas Pydantic para Obras e histórico de status."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.enums import ObraStatusEnum
from app.schemas.user import UserOut


class ObraBase(BaseModel):
    nome: str
    contrato: Optional[str] = None
    numero_sei: Optional[str] = None
    descricao: Optional[str] = None
    valor_contratado: Optional[Decimal] = None
    valor_licitado: Optional[Decimal] = None
    valor_aditivos: Optional[Decimal] = None
    gestor_id: Optional[int] = None
    fiscal_id: Optional[int] = None
    empresa_contratada: Optional[str] = None
    cnpj_empresa: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim_prevista: Optional[datetime] = None
    municipio: Optional[str] = None
    endereco: Optional[str] = None
    secretaria: Optional[str] = None


class ObraCreate(ObraBase):
    pass


class ObraUpdate(BaseModel):
    nome: Optional[str] = None
    contrato: Optional[str] = None
    numero_sei: Optional[str] = None
    descricao: Optional[str] = None
    valor_contratado: Optional[Decimal] = None
    valor_licitado: Optional[Decimal] = None
    valor_aditivos: Optional[Decimal] = None
    gestor_id: Optional[int] = None
    fiscal_id: Optional[int] = None
    empresa_contratada: Optional[str] = None
    cnpj_empresa: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim_prevista: Optional[datetime] = None
    data_fim_real: Optional[datetime] = None
    municipio: Optional[str] = None
    endereco: Optional[str] = None
    secretaria: Optional[str] = None


class ObraStatusUpdate(BaseModel):
    status: ObraStatusEnum
    observacao: Optional[str] = None


class StatusHistoryOut(BaseModel):
    id: int
    status_anterior: Optional[ObraStatusEnum]
    status_novo: ObraStatusEnum
    observacao: Optional[str]
    created_at: datetime
    usuario: Optional[UserOut]

    class Config:
        from_attributes = True


class ObraOut(ObraBase):
    id: int
    status: ObraStatusEnum
    data_fim_real: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    gestor: Optional[UserOut]
    fiscal: Optional[UserOut]

    class Config:
        from_attributes = True


class ObraDetail(ObraOut):
    status_history: List[StatusHistoryOut] = []
