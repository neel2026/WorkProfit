from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
from models.label import Label
from models.user import User, UserRole
from schemas.label import LabelCreate, LabelUpdate, LabelResponse
from api.v1.users import get_current_user

router = APIRouter(prefix="/labels", tags=["Labels"])

def ensure_admin_or_manager(current_user: User):
    if current_user.role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage labels"
        )

@router.get("/", response_model=List[LabelResponse])
async def list_labels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all labels."""
    result = await db.execute(select(Label))
    return result.scalars().all()

@router.post("/", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
async def create_label(
    label_data: LabelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new label."""
    ensure_admin_or_manager(current_user)
    
    # Check if exists
    result = await db.execute(select(Label).where(Label.name == label_data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Label already exists")
    
    new_label = Label(name=label_data.name, color=label_data.color)
    db.add(new_label)
    await db.commit()
    await db.refresh(new_label)
    return new_label

@router.patch("/{label_id}", response_model=LabelResponse)
async def update_label(
    label_id: int,
    label_update: LabelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a label."""
    ensure_admin_or_manager(current_user)
    
    result = await db.execute(select(Label).where(Label.id == label_id))
    label = result.scalar_one_or_none()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    update_data = label_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(label, key, value)
        
    await db.commit()
    await db.refresh(label)
    return label

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label(
    label_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a label."""
    ensure_admin_or_manager(current_user)
    
    result = await db.execute(select(Label).where(Label.id == label_id))
    label = result.scalar_one_or_none()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
        
    await db.delete(label)
    await db.commit()
    return None
