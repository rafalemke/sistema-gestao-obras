"""
Enumerações compartilhadas entre os modelos.
"""
import enum


class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    GESTOR = "gestor"
    FISCAL = "fiscal"
    VISUALIZADOR = "visualizador"


class ObraStatusEnum(str, enum.Enum):
    EM_ELABORACAO = "em_elaboracao"
    LICITACAO = "licitacao"
    CONTRATADA = "contratada"
    EM_EXECUCAO = "em_execucao"
    PARALISADA = "paralisada"
    CONCLUIDA = "concluida"
    RESCINDIDA = "rescindida"
    CANCELADA = "cancelada"


class BMStatusEnum(str, enum.Enum):
    ELABORACAO = "elaboracao"
    ENVIADO = "enviado"
    EM_ANALISE = "em_analise"
    APROVADO = "aprovado"
    PAGO = "pago"
    GLOSADO = "glosado"
    CANCELADO = "cancelado"


class CronogramaStatusEnum(str, enum.Enum):
    RASCUNHO = "rascunho"
    VIGENTE = "vigente"
    REVISADO = "revisado"
    ENCERRADO = "encerrado"


class FonteVerbaEnum(str, enum.Enum):
    TESOURO_ESTADUAL = "tesouro_estadual"
    FEDERAL = "federal"
    BID = "bid"
    BIRD = "bird"
    CONVÊNIO = "convenio"
    OUTRO = "outro"
