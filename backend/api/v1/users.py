from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
from models.user import User, UserRole, Department
from schemas.user import UserResponse, UserUpdate, UserRegister
from core.security import decode_token, hash_password

router = APIRouter(prefix="/users", tags=["Users"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the current user from a Bearer JWT."""
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str | None = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve users. Only accessible by Admins.
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific user by ID.
    """
    # Allow users to see their own profile, or Admins to see anyone
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile"
        )
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserRegister,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user. Only accessible by Admins.
    """
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        role=UserRole(user_data.role),
        department=Department(user_data.department) if user_data.department else None,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user. Only accessible by Admins.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle Enum conversions if necessary
    if "role" in update_data and update_data["role"]:
        update_data["role"] = UserRole(update_data["role"])
    if "department" in update_data and update_data["department"]:
        update_data["department"] = Department(update_data["department"])
        
    for key, value in update_data.items():
        setattr(user, key, value)
        
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int, 
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a user (Soft delete). Only accessible by Admins.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = False
    await db.commit()
    return None
