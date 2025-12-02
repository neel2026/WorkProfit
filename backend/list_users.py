"""
List all users in the database
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os
from dotenv import load_dotenv
from models.user import User

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def list_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        print("\n" + "="*80)
        print("EXISTING USERS IN DATABASE")
        print("="*80)
        for user in users:
            print(f"ID: {user.id} | Email: {user.email} | Role: {user.role.value} | Active: {user.is_active}")
        print("="*80)
        print(f"\nTotal users: {len(users)}")
        
        # Find admin users
        admin_users = [u for u in users if u.role.value == 'ADMIN' and u.is_active]
        if admin_users:
            print("\n🔑 ADMIN USERS:")
            for admin in admin_users:
                print(f"   ✓ {admin.email}")

if __name__ == "__main__":
    asyncio.run(list_users())
