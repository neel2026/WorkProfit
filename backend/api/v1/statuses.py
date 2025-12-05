from fastapi import APIRouter, Depends
from typing import List
from models.task import TaskStatus
from api.v1.users import get_current_user
from models.user import User

router = APIRouter(prefix="/statuses", tags=["Statuses"])


@router.get("/", response_model=List[str])
async def list_statuses(current_user: User = Depends(get_current_user)):
    """Return available task statuses (read-only)."""
    return [status.value for status in TaskStatus]
