import asyncio
from database import AsyncSessionLocal
from models.user import User, UserRole, Department
from core.security import hash_password

async def test_user_creation():
    """Test creating a user directly."""
    async with AsyncSessionLocal() as session:
        try:
            new_user = User(
                email="direct@workprofit.com",
                hashed_password=hash_password("test123"),
                first_name="Direct",
                last_name="Test",
                phone_number="1234567890",
                role=UserRole.ADMIN,
                department=Department.HR
            )
            
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)
            
            print(f"✓ User created successfully!")
            print(f"  ID: {new_user.id}")
            print(f"  Email: {new_user.email}")
            print(f"  Role: {new_user.role}")
            print(f"  Department: {new_user.department}")
            
        except Exception as e:
            print(f"✗ Error creating user: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_user_creation())
