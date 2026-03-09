"""Endpoints para Obras."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.obra import ObraCreate, ObraUpdate, ObraOut, ObraDetail, ObraStatusUpdate, StatusHistoryOut
from app.crud.obra import (
    get_obra, get_obras, create_obra, update_obra,
    update_obra_status, count_obras
)
from app.core.dependencies import (
    get_current_user, require_fiscal_or_above,
    require_gestor_or_above, require_any_authenticated
)
from app.models.user import User

router = APIRouter(prefix="/obras", tags=["Obras"])


@router.get("/", response_model=List[ObraOut])
def list_obras(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = Query(None),
    secretaria: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    return get_obras(db, skip, limit, status, secretaria, search)


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    """Retorna contadores por status para o dashboard."""
    from app.models.enums import ObraStatusEnum
    result = {}
    for s in ObraStatusEnum:
        result[s.value] = count_obras(db, status=s.value)
    result["total"] = count_obras(db)
    return result


@router.post("/", response_model=ObraDetail, status_code=status.HTTP_201_CREATED)
def create(
    obra_in: ObraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_gestor_or_above),
):
    return create_obra(db, obra_in, current_user.id)


@router.get("/{obra_id}", response_model=ObraDetail)
def get_one(
    obra_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    obra = get_obra(db, obra_id)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    return obra


@router.patch("/{obra_id}", response_model=ObraOut)
def update(
    obra_id: int,
    obra_in: ObraUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    obra = get_obra(db, obra_id)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    return update_obra(db, obra, obra_in)


@router.patch("/{obra_id}/status", response_model=ObraDetail)
def change_status(
    obra_id: int,
    status_in: ObraStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_fiscal_or_above),
):
    """Altera o status da obra e registra no histórico."""
    obra = get_obra(db, obra_id)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    return update_obra_status(db, obra, status_in, current_user.id)


@router.get("/{obra_id}/historico", response_model=List[StatusHistoryOut])
def get_historico(
    obra_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    obra = get_obra(db, obra_id)
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    return obra.status_history
