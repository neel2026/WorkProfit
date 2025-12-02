"""
Quick script to create a test admin user
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from models.user import User, UserRole
from core.security import hash_password

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_admin():
    async with AsyncSessionLocal() as session:
        # Create admin user
        admin = User(
            email="admin@workprofit.com",
            hashed_password=hash_password("admin123"),
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN
        )
        
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        
        print(f"✅ Admin user created successfully!")
        print(f"   Email: admin@workprofit.com")
        print(f"   Password: admin123")
        print(f"   User ID: {admin.id}")

if __name__ == "__main__":
    asyncio.run(create_admin())
