"""Endpoints para Cronogramas físico-financeiros."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.cronograma import (
    CronogramaCreate, CronogramaUpdate, CronogramaOut,
    CronogramaItemCreate, CronogramaItemUpdate, CronogramaItemOut,
    MedicaoCronogramaCreate, MedicaoCronogramaOut,
)
from app.crud.cronograma import (
    get_cronograma, get_cronogramas_by_obra, create_cronograma,
    update_cronograma, add_item_to_cronograma, update_cronograma_item,
    add_medicao,
)
from app.models.cronograma import CronogramaItem
from app.core.dependencies import require_fiscal_or_above, require_any_authenticated
from app.models.user import User

router = APIRouter(prefix="/cronogramas", tags=["Cronogramas"])


@router.get("/obra/{obra_id}", response_model=List[CronogramaOut])
def list_cronogramas(
    obra_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    return get_cronogramas_by_obra(db, obra_id)


@router.post("/", response_model=CronogramaOut, status_code=status.HTTP_201_CREATED)
def create(
    cron_in: CronogramaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    return create_cronograma(db, cron_in, current_user.id)


@router.get("/{cronograma_id}", response_model=CronogramaOut)
def get_one(
    cronograma_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    cron = get_cronograma(db, cronograma_id)
    if not cron:
        raise HTTPException(status_code=404, detail="Cronograma não encontrado")
    return cron


@router.patch("/{cronograma_id}", response_model=CronogramaOut)
def update(
    cronograma_id: int,
    cron_in: CronogramaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    cron = get_cronograma(db, cronograma_id)
    if not cron:
        raise HTTPException(status_code=404, detail="Cronograma não encontrado")
    return update_cronograma(db, cron, cron_in)


@router.post("/{cronograma_id}/itens", response_model=CronogramaItemOut, status_code=201)
def add_item(
    cronograma_id: int,
    item_in: CronogramaItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    cron = get_cronograma(db, cronograma_id)
    if not cron:
        raise HTTPException(status_code=404, detail="Cronograma não encontrado")
    return add_item_to_cronograma(db, cronograma_id, item_in)


@router.patch("/itens/{item_id}", response_model=CronogramaItemOut)
def update_item(
    item_id: int,
    item_in: CronogramaItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    item = db.query(CronogramaItem).filter(CronogramaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return update_cronograma_item(db, item, item_in)


@router.post("/medicoes", response_model=MedicaoCronogramaOut, status_code=201)
def registrar_medicao(
    med_in: MedicaoCronogramaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    return add_medicao(db, med_in, current_user.id)
