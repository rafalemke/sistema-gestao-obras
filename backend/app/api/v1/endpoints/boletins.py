"""Endpoints para Boletins de Medição."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.boletim import BMCreate, BMUpdate, BMOut, BMDetail, BMStatusUpdate, BMStatusHistoryOut
from app.crud.boletim import get_bm, get_bms_by_obra, create_bm, update_bm, update_bm_status
from app.crud.obra import get_obra
from app.core.dependencies import (
    get_current_user, require_fiscal_or_above, require_any_authenticated
)
from app.models.user import User

router = APIRouter(prefix="/boletins", tags=["Boletins de Medição"])


@router.get("/obra/{obra_id}", response_model=List[BMOut])
def list_bms(
    obra_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    return get_bms_by_obra(db, obra_id, status)


@router.post("/", response_model=BMDetail, status_code=status.HTTP_201_CREATED)
def create(
    bm_in: BMCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    obra = get_obra(db, bm_in.obra_id)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    return create_bm(db, bm_in, current_user.id)


@router.get("/{bm_id}", response_model=BMDetail)
def get_one(
    bm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    bm = get_bm(db, bm_id)
    if not bm:
        raise HTTPException(status_code=404, detail="Boletim não encontrado")
    return bm


@router.patch("/{bm_id}", response_model=BMOut)
def update(
    bm_id: int,
    bm_in: BMUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    bm = get_bm(db, bm_id)
    if not bm:
        raise HTTPException(status_code=404, detail="Boletim não encontrado")
    return update_bm(db, bm, bm_in)


@router.patch("/{bm_id}/status", response_model=BMDetail)
def change_status(
    bm_id: int,
    status_in: BMStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    """Altera o status do BM e registra no histórico."""
    bm = get_bm(db, bm_id)
    if not bm:
        raise HTTPException(status_code=404, detail="Boletim não encontrado")
    return update_bm_status(db, bm, status_in, current_user.id)


@router.get("/{bm_id}/historico", response_model=List[BMStatusHistoryOut])
def get_historico(
    bm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    bm = get_bm(db, bm_id)
    if not bm:
        raise HTTPException(status_code=404, detail="Boletim não encontrado")
    return bm.status_history
