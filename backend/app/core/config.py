"""
Configurações centrais da aplicação via variáveis de ambiente.
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "Sistema de Gestão de Obras"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    ALLOWED_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    @property
    def origins_list(self) -> List[str]:
        return json.loads(self.ALLOWED_ORIGINS)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
