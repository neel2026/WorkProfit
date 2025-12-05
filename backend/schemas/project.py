from pydantic import BaseModel, model_validator, field_validator
from typing import Literal, List, Optional
from datetime import date, datetime

ProjectStatusType = Literal["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]


class UserBrief(BaseModel):
    """Brief user info for displaying in project lists."""
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    client_id: int | None = None
    team_lead_id: int | None = None
    start_date: date
    end_date: date
    status: ProjectStatusType = "PLANNING"
    document_url: str | None = None
    member_ids: List[int] = []  # List of user IDs to add as members
    
    @model_validator(mode='after')
    def validate_timeline(self):
        """
        Scenario 4: Timeline Safety
        Ensure end_date is strictly greater than start_date.
        """
        if self.end_date <= self.start_date:
            raise ValueError(
                f"End date ({self.end_date}) must be after start date ({self.start_date}). "
                f"A project cannot end before or on the same day it starts."
            )
        return self


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    client_id: int | None = None
    team_lead_id: int | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: ProjectStatusType | None = None
    document_url: str | None = None
    member_ids: List[int] | None = None  # Update member list
    
    @model_validator(mode='after')
    def validate_timeline_update(self):
        """
        Scenario 4: Timeline Safety (for updates)
        If both dates are provided, ensure end_date > start_date.
        """
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                raise ValueError(
                    f"End date ({self.end_date}) must be after start date ({self.start_date})."
                )
        return self


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    client_id: int | None
    team_lead_id: int | None
    start_date: date
    end_date: date
    status: str
    document_url: str | None
    created_at: datetime
    progress_percentage: float | None = None  # Computed property
    duration_days: int | None = None  # Computed property
    time_used: int | None = None  # Computed property: Elapsed days
    task_count: int | None = None  # Number of tasks
    
    # Expanded user details
    team_lead: Optional[UserBrief] = None
    client: Optional[UserBrief] = None
    members: List[UserBrief] = []
    
    class Config:
        from_attributes = True


class ProjectMemberAdd(BaseModel):
    """Schema for adding members to a project."""
    user_ids: List[int]


class ProjectMemberRemove(BaseModel):
    """Schema for removing members from a project."""
    user_ids: List[int]
