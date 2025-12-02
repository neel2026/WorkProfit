"""
Audit Test: Orphaned Data Protection
Verifies that deleting a user does NOT delete their assigned projects.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
import os
from dotenv import load_dotenv
from models.user import User, UserRole
from models.project import Project, ProjectStatus
from core.security import hash_password
from datetime import date

# Load env vars
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test_orphaned_data_protection():
    async with AsyncSessionLocal() as session:
        # Generate unique email using timestamp
        import time
        unique_email = f"audit_{int(time.time())}@example.com"
        
        print("1. Creating a temporary User...")
        # Create a user
        user = User(
            email=unique_email,
            hashed_password=hash_password("password123"),
            first_name="Audit",
            last_name="User",
            role=UserRole.PROJECT_MANAGER
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        user_id = user.id
        print(f"   -> User created with ID: {user_id}")
        
        print("2. Creating a Project assigned to this User...")
        # Create a project assigned to this user
        project = Project(
            name="Audit Project",
            description="Testing orphaned data protection",
            team_lead_id=user_id,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            status=ProjectStatus.PLANNING
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)
        project_id = project.id
        print(f"   -> Project created with ID: {project_id}, Team Lead ID: {project.team_lead_id}")
        
        print("3. Deleting the User...")
        # Delete the user
        await session.delete(user)
        await session.commit()
        print("   -> User deleted.")
        
        print("4. Verifying Project status...")
        # Create a new session to avoid cache issues
        async with AsyncSessionLocal() as verify_session:
            # Check if project still exists
            result = await verify_session.execute(select(Project).where(Project.id == project_id))
            project_after = result.scalar_one_or_none()
            
            if project_after:
                print(f"   -> [PASS] Project {project_id} still exists.")
                
                if project_after.team_lead_id is None:
                    print("   -> [PASS] Project team_lead_id is now None (SET NULL worked).")
                    
                    # Cleanup: delete the test project
                    await verify_session.delete(project_after)
                    await verify_session.commit()
                    print("   -> Cleanup: Test project deleted.")
                    return True
                else:
                    print(f"   -> [FAIL] Project team_lead_id is {project_after.team_lead_id} (Expected None).")
                    # Cleanup even on failure
                    await verify_session.delete(project_after)
                    await verify_session.commit()
                    return False
            else:
                print("   -> [FAIL] Project was deleted (Cascade delete occurred!).")
                return False

if __name__ == "__main__":
    try:
        success = asyncio.run(test_orphaned_data_protection())
        if success:
            print("\n✅ AUDIT PASSED: Orphaned Data Protection is active.")
            exit(0)
        else:
            print("\n❌ AUDIT FAILED: Data integrity issue detected.")
            exit(1)
    except Exception as e:
        print(f"\n❌ AUDIT ERROR: {str(e)}")
        exit(1)
