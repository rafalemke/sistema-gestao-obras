"""
Modelos de Cronograma físico-financeiro e seus itens.
"""
from sqlalchemy import (
    Column, Integer, String, Enum, DateTime, Numeric,
    ForeignKey, Text, func, Date, Boolean
)
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import CronogramaStatusEnum


class Cronograma(Base):
    __tablename__ = "cronogramas"

    id = Column(Integer, primary_key=True, index=True)
    obra_id = Column(Integer, ForeignKey("obras.id"), nullable=False, index=True)
    versao = Column(Integer, default=1, nullable=False)
    descricao = Column(String(255), nullable=True)
    status = Column(
        Enum(CronogramaStatusEnum),
        default=CronogramaStatusEnum.RASCUNHO,
        nullable=False,
    )
    data_inicio = Column(Date, nullable=True)
    data_fim = Column(Date, nullable=True)
    is_vigente = Column(Boolean, default=False)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    obra = relationship("Obra", back_populates="cronogramas")
    criado_por = relationship("User", foreign_keys=[created_by])
    itens = relationship(
        "CronogramaItem", back_populates="cronograma", order_by="CronogramaItem.ordem"
    )


class CronogramaItem(Base):
    """Etapa/serviço dentro do cronograma."""
    __tablename__ = "cronograma_itens"

    id = Column(Integer, primary_key=True, index=True)
    cronograma_id = Column(Integer, ForeignKey("cronogramas.id"), nullable=False, index=True)
    descricao = Column(String(255), nullable=False)
    unidade = Column(String(30), nullable=True)
    quantidade = Column(Numeric(15, 3), nullable=True)
    valor_unitario = Column(Numeric(15, 2), nullable=True)
    valor_total = Column(Numeric(15, 2), nullable=True)
    percentual_previsto = Column(Numeric(6, 2), default=0)
    percentual_realizado = Column(Numeric(6, 2), default=0)
    ordem = Column(Integer, default=0)
    data_inicio_prevista = Column(Date, nullable=True)
    data_fim_prevista = Column(Date, nullable=True)

    cronograma = relationship("Cronograma", back_populates="itens")
    medicoes = relationship("MedicaoCronograma", back_populates="item")


class MedicaoCronograma(Base):
    """Registro de avanço físico-financeiro por período para cada item."""
    __tablename__ = "medicao_cronograma"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("cronograma_itens.id"), nullable=False, index=True)
    bm_id = Column(Integer, ForeignKey("boletins_medicao.id"), nullable=True)
    percentual_realizado = Column(Numeric(6, 2), default=0)
    valor_realizado = Column(Numeric(15, 2), default=0)
    periodo_referencia = Column(Date, nullable=True)
    observacao = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    item = relationship("CronogramaItem", back_populates="medicoes")
    boletim = relationship("BoletimMedicao")
    criado_por = relationship("User", foreign_keys=[created_by])
