"""
Modelo de Obra e histórico de status.
"""
from sqlalchemy import (
    Column, Integer, String, Enum, DateTime, Numeric,
    ForeignKey, Text, func
)
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import ObraStatusEnum


class Obra(Base):
    __tablename__ = "obras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    contrato = Column(String(60), nullable=True)
    numero_sei = Column(String(60), nullable=True, index=True)
    descricao = Column(Text, nullable=True)

    # Financeiro
    valor_contratado = Column(Numeric(15, 2), nullable=True)
    valor_licitado = Column(Numeric(15, 2), nullable=True)
    valor_aditivos = Column(Numeric(15, 2), default=0)

    # Responsáveis
    gestor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    fiscal_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    empresa_contratada = Column(String(200), nullable=True)
    cnpj_empresa = Column(String(20), nullable=True)

    # Prazos
    data_inicio = Column(DateTime, nullable=True)
    data_fim_prevista = Column(DateTime, nullable=True)
    data_fim_real = Column(DateTime, nullable=True)

    # Localização
    municipio = Column(String(100), nullable=True)
    endereco = Column(String(255), nullable=True)
    secretaria = Column(String(150), nullable=True)

    # Status
    status = Column(
        Enum(ObraStatusEnum),
        nullable=False,
        default=ObraStatusEnum.EM_ELABORACAO,
        index=True,
    )

    # Auditoria
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relacionamentos
    gestor = relationship("User", foreign_keys=[gestor_id])
    fiscal = relationship("User", foreign_keys=[fiscal_id])
    criado_por = relationship("User", foreign_keys=[created_by])
    status_history = relationship(
        "ObraStatusHistory", back_populates="obra", order_by="ObraStatusHistory.created_at"
    )
    boletins = relationship("BoletimMedicao", back_populates="obra")
    cronogramas = relationship("Cronograma", back_populates="obra")


class ObraStatusHistory(Base):
    __tablename__ = "obra_status_history"

    id = Column(Integer, primary_key=True, index=True)
    obra_id = Column(Integer, ForeignKey("obras.id"), nullable=False, index=True)
    status_anterior = Column(Enum(ObraStatusEnum), nullable=True)
    status_novo = Column(Enum(ObraStatusEnum), nullable=False)
    observacao = Column(Text, nullable=True)
    alterado_por = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    obra = relationship("Obra", back_populates="status_history")
    usuario = relationship("User", foreign_keys=[alterado_por])
