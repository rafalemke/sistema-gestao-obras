"""
Modelo de Boletim de Medição e histórico de status.
"""
from sqlalchemy import (
    Column, Integer, String, Enum, DateTime, Numeric,
    ForeignKey, Text, func, Date
)
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import BMStatusEnum, FonteVerbaEnum


class BoletimMedicao(Base):
    __tablename__ = "boletins_medicao"

    id = Column(Integer, primary_key=True, index=True)
    obra_id = Column(Integer, ForeignKey("obras.id"), nullable=False, index=True)
    numero_bm = Column(Integer, nullable=False)
    numero_sei = Column(String(60), nullable=True)

    # Período
    periodo_inicio = Column(Date, nullable=True)
    periodo_fim = Column(Date, nullable=True)
    data_emissao = Column(Date, nullable=True)

    # Financeiro
    valor = Column(Numeric(15, 2), nullable=True)
    fonte_verba = Column(Enum(FonteVerbaEnum), nullable=True)

    # Status e observações
    status = Column(
        Enum(BMStatusEnum),
        nullable=False,
        default=BMStatusEnum.ELABORACAO,
        index=True,
    )
    observacao = Column(Text, nullable=True)

    # Auditoria
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relacionamentos
    obra = relationship("Obra", back_populates="boletins")
    criado_por = relationship("User", foreign_keys=[created_by])
    status_history = relationship(
        "BMStatusHistory",
        back_populates="boletim",
        order_by="BMStatusHistory.created_at",
    )


class BMStatusHistory(Base):
    __tablename__ = "bm_status_history"

    id = Column(Integer, primary_key=True, index=True)
    bm_id = Column(Integer, ForeignKey("boletins_medicao.id"), nullable=False, index=True)
    status_anterior = Column(Enum(BMStatusEnum), nullable=True)
    status_novo = Column(Enum(BMStatusEnum), nullable=False)
    observacao = Column(Text, nullable=True)
    alterado_por = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    boletim = relationship("BoletimMedicao", back_populates="status_history")
    usuario = relationship("User", foreign_keys=[alterado_por])
