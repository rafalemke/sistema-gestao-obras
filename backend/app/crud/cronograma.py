"""Operações CRUD para Cronogramas físico-financeiros."""
from sqlalchemy.orm import Session, joinedload
from app.models.cronograma import Cronograma, CronogramaItem, MedicaoCronograma
from app.schemas.cronograma import (
    CronogramaCreate, CronogramaUpdate,
    CronogramaItemCreate, CronogramaItemUpdate,
    MedicaoCronogramaCreate,
)
from typing import Optional, List


def get_cronograma(db: Session, cronograma_id: int) -> Optional[Cronograma]:
    return (
        db.query(Cronograma)
        .options(joinedload(Cronograma.itens))
        .filter(Cronograma.id == cronograma_id)
        .first()
    )


def get_cronogramas_by_obra(db: Session, obra_id: int) -> List[Cronograma]:
    return (
        db.query(Cronograma)
        .options(joinedload(Cronograma.itens))
        .filter(Cronograma.obra_id == obra_id)
        .order_by(Cronograma.versao.desc())
        .all()
    )


def create_cronograma(
    db: Session, cron_in: CronogramaCreate, created_by: int
) -> Cronograma:
    # Determina a próxima versão
    last = (
        db.query(Cronograma)
        .filter(Cronograma.obra_id == cron_in.obra_id)
        .order_by(Cronograma.versao.desc())
        .first()
    )
    next_version = (last.versao + 1) if last else 1

    itens_data = cron_in.itens
    cron_dict = cron_in.model_dump(exclude={"itens"})
    cronograma = Cronograma(**cron_dict, versao=next_version, created_by=created_by)
    db.add(cronograma)
    db.flush()

    for item_in in itens_data:
        item = CronogramaItem(**item_in.model_dump(), cronograma_id=cronograma.id)
        db.add(item)

    db.commit()
    db.refresh(cronograma)
    return cronograma


def update_cronograma(
    db: Session, cronograma: Cronograma, cron_in: CronogramaUpdate
) -> Cronograma:
    update_data = cron_in.model_dump(exclude_unset=True)
    # Se estiver marcando como vigente, desmarca os demais da mesma obra
    if update_data.get("is_vigente"):
        db.query(Cronograma).filter(
            Cronograma.obra_id == cronograma.obra_id,
            Cronograma.id != cronograma.id,
        ).update({"is_vigente": False})
    for field, value in update_data.items():
        setattr(cronograma, field, value)
    db.commit()
    db.refresh(cronograma)
    return cronograma


def add_item_to_cronograma(
    db: Session, cronograma_id: int, item_in: CronogramaItemCreate
) -> CronogramaItem:
    item = CronogramaItem(**item_in.model_dump(), cronograma_id=cronograma_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_cronograma_item(
    db: Session, item: CronogramaItem, item_in: CronogramaItemUpdate
) -> CronogramaItem:
    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def add_medicao(
    db: Session, med_in: MedicaoCronogramaCreate, created_by: int
) -> MedicaoCronograma:
    med = MedicaoCronograma(**med_in.model_dump(), created_by=created_by)
    db.add(med)
    # Atualiza percentual realizado no item
    item = db.query(CronogramaItem).filter(CronogramaItem.id == med_in.item_id).first()
    if item:
        item.percentual_realizado = med_in.percentual_realizado
    db.commit()
    db.refresh(med)
    return med
