"""
Script para criação das tabelas e seed inicial (usuário admin).
Execute: python init_db.py
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.db.session import engine, SessionLocal
from app.models import *  # noqa - importa todos os modelos para o Base
from app.db.session import Base
from app.crud.user import create_user, get_user_by_email
from app.schemas.user import UserCreate
from app.models.enums import RoleEnum


def init_db():
    print("⚙️  Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")

    db = SessionLocal()
    try:
        # Seed: usuário admin
        admin_email = "admin@obras.gov.br"
        if not get_user_by_email(db, admin_email):
            create_user(
                db,
                UserCreate(
                    nome="Administrador",
                    email=admin_email,
                    password="Admin@123",
                    role=RoleEnum.ADMIN,
                    setor="TI",
                ),
            )
            print(f"✅ Usuário admin criado: {admin_email} / Admin@123")
        else:
            print("ℹ️  Usuário admin já existe.")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
