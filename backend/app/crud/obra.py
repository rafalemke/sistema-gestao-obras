"""Operações CRUD para Obras com registro de histórico de status."""
from sqlalchemy.orm import Session, joinedload
from app.models.obra import Obra, ObraStatusHistory
from app.schemas.obra import ObraCreate, ObraUpdate, ObraStatusUpdate
from typing import Optional, List


def get_obra(db: Session, obra_id: int) -> Optional[Obra]:
    return (
        db.query(Obra)
        .options(
            joinedload(Obra.gestor),
            joinedload(Obra.fiscal),
            joinedload(Obra.status_history).joinedload(ObraStatusHistory.usuario),
        )
        .filter(Obra.id == obra_id)
        .first()
    )


def get_obras(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    secretaria: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Obra]:
    q = db.query(Obra).options(joinedload(Obra.gestor), joinedload(Obra.fiscal))
    if status:
        q = q.filter(Obra.status == status)
    if secretaria:
        q = q.filter(Obra.secretaria.ilike(f"%{secretaria}%"))
    if search:
        q = q.filter(
            Obra.nome.ilike(f"%{search}%") | Obra.contrato.ilike(f"%{search}%")
        )
    return q.order_by(Obra.created_at.desc()).offset(skip).limit(limit).all()


def count_obras(db: Session, status: Optional[str] = None) -> int:
    q = db.query(Obra)
    if status:
        q = q.filter(Obra.status == status)
    return q.count()


def create_obra(db: Session, obra_in: ObraCreate, created_by: int) -> Obra:
    obra = Obra(**obra_in.model_dump(), created_by=created_by)
    db.add(obra)
    db.flush()
    # Registra status inicial no histórico
    history = ObraStatusHistory(
        obra_id=obra.id,
        status_anterior=None,
        status_novo=obra.status,
        observacao="Obra cadastrada",
        alterado_por=created_by,
    )
    db.add(history)
    db.commit()
    db.refresh(obra)
    return obra


def update_obra(db: Session, obra: Obra, obra_in: ObraUpdate) -> Obra:
    for field, value in obra_in.model_dump(exclude_unset=True).items():
        setattr(obra, field, value)
    db.commit()
    db.refresh(obra)
    return obra


def update_obra_status(
    db: Session,
    obra: Obra,
    status_in: ObraStatusUpdate,
    altered_by: int,
) -> Obra:
    history = ObraStatusHistory(
        obra_id=obra.id,
        status_anterior=obra.status,
        status_novo=status_in.status,
        observacao=status_in.observacao,
        alterado_por=altered_by,
    )
    db.add(history)
    obra.status = status_in.status
    db.commit()
    db.refresh(obra)
    return obra
