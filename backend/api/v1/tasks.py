from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from database import get_db
from models.task import Task
from models.project import Project, project_members
from models.user import User, UserRole
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from api.v1.users import get_current_user
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def has_project_access(project: Project, current_user: User) -> bool:
    """Check if the user can manage/view tasks for this project."""
    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        return True
    if project.team_lead_id == current_user.id:
        return True
    if hasattr(project, "members") and any(m.id == current_user.id for m in project.members):
        return True
    return False


async def validate_assignee(assignee_id: int | None, project: Project, db: AsyncSession):
    """Ensure assignee exists and is part of the project (or is a lead/manager)."""
    if assignee_id is None:
        return
    result = await db.execute(select(User).where(User.id == assignee_id))
    assignee = result.scalar_one_or_none()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    member_ids = {m.id for m in getattr(project, "members", [])}
    if assignee.id != project.team_lead_id and assignee.id not in member_ids and assignee.role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        raise HTTPException(status_code=400, detail="Assignee must be a project member or team lead")

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify project exists and user has access
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.members))
        .where(Project.id == task_data.project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not has_project_access(project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to create tasks for this project")

    await validate_assignee(task_data.assignee_id, project, db)

    new_task = Task(**task_data.model_dump())
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        query = select(Task)
    else:
        query = (
            select(Task)
            .join(Project, Task.project_id == Project.id)
            .outerjoin(project_members, project_members.c.project_id == Project.id)
            .where(
                or_(
                    Project.team_lead_id == current_user.id,
                    project_members.c.user_id == current_user.id,
                )
            )
            .distinct()
        )
    if project_id:
        query = query.where(Task.project_id == project_id)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.project).selectinload(Project.members)
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not task.project or not has_project_access(task.project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to view this task")
    return task

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.project).selectinload(Project.members)
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not task.project or not has_project_access(task.project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
        
    update_data = task_update.model_dump(exclude_unset=True)
    if "assignee_id" in update_data:
        await validate_assignee(update_data["assignee_id"], task.project, db)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.project).selectinload(Project.members)
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not task.project or not has_project_access(task.project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
        
    await db.delete(task)
    await db.commit()
    return None
