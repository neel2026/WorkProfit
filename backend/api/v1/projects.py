from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List
from database import get_db
from models.project import Project, project_members
from models.user import User, UserRole
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMemberAdd, ProjectMemberRemove
from api.v1.users import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


def can_manage_project(project: Project, current_user: User) -> bool:
    """Admins/PMs can manage any; team leads can manage their own projects."""
    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        return True
    if project.team_lead_id == current_user.id:
        return True
    return False

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
    if current_user.role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create projects")
    
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
        unique_member_ids = list(dict.fromkeys(project_data.member_ids))
        result = await db.execute(select(User).where(User.id.in_(unique_member_ids)))
        members = result.scalars().all()
        if len(members) != len(unique_member_ids):
            missing = set(unique_member_ids) - {m.id for m in members}
            raise HTTPException(status_code=404, detail=f"Member(s) not found: {missing}")
        project.members.extend(members)
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
    """List all projects with team lead, client, and member details."""
    from models.task import Task  # Import here to avoid circular imports
    from schemas.project import UserBrief

    base_query = (
        select(Project)
        .options(
            selectinload(Project.team_lead),
            selectinload(Project.client),
            selectinload(Project.members)
        )
        .offset(skip)
        .limit(limit)
    )

    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        result = await db.execute(base_query)
    else:
        # Restrict to projects where user is team lead or member
        result = await db.execute(
            base_query
            .outerjoin(project_members, project_members.c.project_id == Project.id)
            .where(
                or_(
                    Project.team_lead_id == current_user.id,
                    project_members.c.user_id == current_user.id,
                )
            )
            .distinct()
        )

    projects = result.scalars().all()
    
    # Add computed properties to each project
    project_responses = []
    for project in projects:
        # Count tasks for this project
        task_count_result = await db.execute(
            select(Task).where(Task.project_id == project.id)
        )
        task_count = len(task_count_result.scalars().all())
        
        response = ProjectResponse.model_validate(project)
        response.progress_percentage = project.progress_percentage
        response.duration_days = project.duration_days
        response.time_used = project.time_used
        response.task_count = task_count
        
        # Add user details
        if project.team_lead:
            response.team_lead = UserBrief.model_validate(project.team_lead)
        if project.client:
            response.client = UserBrief.model_validate(project.client)
        if project.members:
            response.members = [UserBrief.model_validate(m) for m in project.members]
        
        project_responses.append(response)
    
    return project_responses

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project by ID with full details."""
    from schemas.project import UserBrief
    
    base_query = (
        select(Project)
        .options(
            selectinload(Project.team_lead),
            selectinload(Project.client),
            selectinload(Project.members)
        )
        .where(Project.id == project_id)
    )
    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        result = await db.execute(base_query)
    else:
        result = await db.execute(
            base_query
            .outerjoin(project_members, project_members.c.project_id == Project.id)
            .where(
                or_(
                    Project.team_lead_id == current_user.id,
                    project_members.c.user_id == current_user.id,
                )
            )
            .distinct()
        )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    response = ProjectResponse.model_validate(project)
    response.progress_percentage = project.progress_percentage
    response.duration_days = project.duration_days
    response.time_used = project.time_used
    
    # Add user details
    if project.team_lead:
        response.team_lead = UserBrief.model_validate(project.team_lead)
    if project.client:
        response.client = UserBrief.model_validate(project.client)
    if project.members:
        response.members = [UserBrief.model_validate(m) for m in project.members]
    
    return response

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a project."""
    # FIX: Eager load members to prevent MissingGreenlet error
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.members))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Authorization: admins/PMs or assigned team lead
    if not can_manage_project(project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to update this project")

    # TEAM_LEAD restriction: they cannot change client or team lead assignments
    if current_user.role == UserRole.TEAM_LEAD:
        if project_update.team_lead_id and project_update.team_lead_id != project.team_lead_id:
            raise HTTPException(
                status_code=403,
                detail="Team Leads cannot reassign the team lead; contact an Admin or Project Manager."
            )
        if project_update.client_id and project_update.client_id != project.client_id:
            raise HTTPException(
                status_code=403,
                detail="Team Leads cannot change the client; contact an Admin or Project Manager."
            )

    # Validate team lead role if updating
    if project_update.team_lead_id:
        await validate_team_lead(project_update.team_lead_id, db)
    
    # Validate client role if updating
    if project_update.client_id:
        await validate_client(project_update.client_id, db)
    
    # Update fields with timeline safety if only one date provided
    update_data = project_update.model_dump(exclude_unset=True)
    member_ids = update_data.pop('member_ids', None)

    new_start = update_data.get("start_date", project.start_date)
    new_end = update_data.get("end_date", project.end_date)
    if new_end <= new_start:
        raise HTTPException(
            status_code=400,
            detail=f"End date ({new_end}) must be after start date ({new_start})."
        )

    for key, value in update_data.items():
        setattr(project, key, value)
    
    # Update members if provided
    if member_ids is not None:
        unique_member_ids = list(dict.fromkeys(member_ids))
        result = await db.execute(select(User).where(User.id.in_(unique_member_ids)))
        members = result.scalars().all()
        if len(members) != len(unique_member_ids):
            missing = set(unique_member_ids) - {m.id for m in members}
            raise HTTPException(status_code=404, detail=f"Member(s) not found: {missing}")
        project.members.clear()
        project.members.extend(members)
    
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
    if not can_manage_project(project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    await db.delete(project)
    await db.commit()
    return None
