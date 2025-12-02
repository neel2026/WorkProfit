from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
from models.project import Project, project_members
from models.user import User, UserRole
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMemberAdd, ProjectMemberRemove
from api.v1.users import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

async def validate_team_lead(user_id: int, db: AsyncSession):
    """
    Scenario 5: Validate that team_lead has role TEAM_LEAD or STAFF.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    if user.role not in [UserRole.TEAM_LEAD, UserRole.STAFF]:
        raise HTTPException(
            status_code=400,
            detail=f"User {user_id} has role '{user.role}'. Team Lead must have role TEAM_LEAD or STAFF."
        )
    return user

async def validate_client(user_id: int, db: AsyncSession):
    """
    Scenario 5: Validate that client has role CLIENT.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    if user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=400,
            detail=f"User {user_id} has role '{user.role}'. Client must have role CLIENT."
        )
    return user

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project with role validation."""
    
    # Validate team lead role if provided
    if project_data.team_lead_id:
        await validate_team_lead(project_data.team_lead_id, db)
    
    # Validate client role if provided
    if project_data.client_id:
        await validate_client(project_data.client_id, db)
    
    # Create project
    project = Project(
        name=project_data.name,
        description=project_data.description,
        client_id=project_data.client_id,
        team_lead_id=project_data.team_lead_id,
        start_date=project_data.start_date,
        end_date=project_data.end_date,
        status=project_data.status
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Add members if provided
    if project_data.member_ids:
        for user_id in project_data.member_ids:
            # Verify user exists
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                project.members.append(user)
        await db.commit()
        await db.refresh(project)
    
    # Add computed properties
    response_dict = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "client_id": project.client_id,
        "team_lead_id": project.team_lead_id,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "status": project.status.value,
        "created_at": project.created_at.isoformat(),
        "progress_percentage": project.progress_percentage,
        "duration_days": project.duration_days
    }
    
    return ProjectResponse(**response_dict)

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects."""
    result = await db.execute(select(Project).offset(skip).limit(limit))
    projects = result.scalars().all()
    
    # Add computed properties to each project
    project_responses = []
    for project in projects:
        response = ProjectResponse.model_validate(project)
        response.progress_percentage = project.progress_percentage
        response.duration_days = project.duration_days
        project_responses.append(response)
    
    return project_responses

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project by ID."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    response = ProjectResponse.model_validate(project)
    response.progress_percentage = project.progress_percentage
    response.duration_days = project.duration_days
    
    return response

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a project."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate team lead role if updating
    if project_update.team_lead_id:
        await validate_team_lead(project_update.team_lead_id, db)
    
    # Validate client role if updating
    if project_update.client_id:
        await validate_client(project_update.client_id, db)
    
    # Update fields
    update_data = project_update.model_dump(exclude_unset=True)
    member_ids = update_data.pop('member_ids', None)
    
    for key, value in update_data.items():
        setattr(project, key, value)
    
    # Update members if provided
    if member_ids is not None:
        # Clear existing members
        project.members.clear()
        # Add new members
        for user_id in member_ids:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                project.members.append(user)
    
    await db.commit()
    await db.refresh(project)
    
    response = ProjectResponse.model_validate(project)
    response.progress_percentage = project.progress_percentage
    response.duration_days = project.duration_days
    
    return response

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a project."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(project)
    await db.commit()
    return None
