"""Operações CRUD para Boletins de Medição."""
from sqlalchemy.orm import Session, joinedload
from app.models.boletim import BoletimMedicao, BMStatusHistory
from app.schemas.boletim import BMCreate, BMUpdate, BMStatusUpdate
from typing import Optional, List


def get_bm(db: Session, bm_id: int) -> Optional[BoletimMedicao]:
    return (
        db.query(BoletimMedicao)
        .options(
            joinedload(BoletimMedicao.status_history).joinedload(BMStatusHistory.usuario)
        )
        .filter(BoletimMedicao.id == bm_id)
        .first()
    )


def get_bms_by_obra(
    db: Session, obra_id: int, status: Optional[str] = None
) -> List[BoletimMedicao]:
    q = db.query(BoletimMedicao).filter(BoletimMedicao.obra_id == obra_id)
    if status:
        q = q.filter(BoletimMedicao.status == status)
    return q.order_by(BoletimMedicao.numero_bm).all()


def create_bm(db: Session, bm_in: BMCreate, created_by: int) -> BoletimMedicao:
    bm = BoletimMedicao(**bm_in.model_dump(), created_by=created_by)
    db.add(bm)
    db.flush()
    history = BMStatusHistory(
        bm_id=bm.id,
        status_anterior=None,
        status_novo=bm.status,
        observacao="Boletim criado",
        alterado_por=created_by,
    )
    db.add(history)
    db.commit()
    db.refresh(bm)
    return bm


def update_bm(db: Session, bm: BoletimMedicao, bm_in: BMUpdate) -> BoletimMedicao:
    for field, value in bm_in.model_dump(exclude_unset=True).items():
        setattr(bm, field, value)
    db.commit()
    db.refresh(bm)
    return bm


def update_bm_status(
    db: Session,
    bm: BoletimMedicao,
    status_in: BMStatusUpdate,
    altered_by: int,
) -> BoletimMedicao:
    history = BMStatusHistory(
        bm_id=bm.id,
        status_anterior=bm.status,
        status_novo=status_in.status,
        observacao=status_in.observacao,
        alterado_por=altered_by,
    )
    db.add(history)
    bm.status = status_in.status
    db.commit()
    db.refresh(bm)
    return bm
