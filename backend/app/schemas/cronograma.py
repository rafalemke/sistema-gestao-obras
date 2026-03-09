"""Schemas Pydantic para Cronogramas físico-financeiros."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.models.enums import CronogramaStatusEnum


class CronogramaItemBase(BaseModel):
    descricao: str
    unidade: Optional[str] = None
    quantidade: Optional[Decimal] = None
    valor_unitario: Optional[Decimal] = None
    valor_total: Optional[Decimal] = None
    percentual_previsto: Optional[Decimal] = None
    ordem: int = 0
    data_inicio_prevista: Optional[date] = None
    data_fim_prevista: Optional[date] = None


class CronogramaItemCreate(CronogramaItemBase):
    pass


class CronogramaItemUpdate(BaseModel):
    descricao: Optional[str] = None
    unidade: Optional[str] = None
    quantidade: Optional[Decimal] = None
    valor_unitario: Optional[Decimal] = None
    valor_total: Optional[Decimal] = None
    percentual_previsto: Optional[Decimal] = None
    percentual_realizado: Optional[Decimal] = None
    ordem: Optional[int] = None
    data_inicio_prevista: Optional[date] = None
    data_fim_prevista: Optional[date] = None


class CronogramaItemOut(CronogramaItemBase):
    id: int
    percentual_realizado: Decimal = Decimal("0")

    class Config:
        from_attributes = True


class CronogramaBase(BaseModel):
    descricao: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None


class CronogramaCreate(CronogramaBase):
    obra_id: int
    itens: List[CronogramaItemCreate] = []


class CronogramaUpdate(BaseModel):
    descricao: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    status: Optional[CronogramaStatusEnum] = None
    is_vigente: Optional[bool] = None


class CronogramaOut(CronogramaBase):
    id: int
    obra_id: int
    versao: int
    status: CronogramaStatusEnum
    is_vigente: bool
    created_at: datetime
    itens: List[CronogramaItemOut] = []

    class Config:
        from_attributes = True


class MedicaoCronogramaCreate(BaseModel):
    item_id: int
    bm_id: Optional[int] = None
    percentual_realizado: Decimal
    valor_realizado: Decimal
    periodo_referencia: Optional[date] = None
    observacao: Optional[str] = None


class MedicaoCronogramaOut(MedicaoCronogramaCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
