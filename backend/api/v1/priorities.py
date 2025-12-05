from fastapi import APIRouter, Depends
from typing import List
from models.task import TaskPriority
from api.v1.users import get_current_user
from models.user import User

router = APIRouter(prefix="/priorities", tags=["Priorities"])


@router.get("/", response_model=List[str])
async def list_priorities(current_user: User = Depends(get_current_user)):
    """Return available task priorities (read-only)."""
    return [priority.value for priority in TaskPriority]
