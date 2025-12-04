from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, date
import enum
from database import Base

class ProjectStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# Association table for many-to-many relationship between Projects and Users (Members)
project_members = Table(
    'project_members',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete="CASCADE"), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('joined_at', DateTime(timezone=True), server_default=func.now())
)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Foreign Keys with ON DELETE SET NULL to prevent cascade deletion
    client_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    team_lead_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    client = relationship("User", foreign_keys=[client_id], backref="client_projects")
    team_lead = relationship("User", foreign_keys=[team_lead_id], backref="lead_projects")
    
    # Many-to-many relationship with Users (Project Members)
    members = relationship(
        "User",
        secondary=project_members,
        backref="member_projects"
    )

    # One-to-many relationship with Tasks
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    
    @property
    def progress_percentage(self) -> float:
        """
        Calculate project progress based on time elapsed.
        Returns 0 if total duration is 0 to avoid ZeroDivisionError.
        """
        today = date.today()
        
        # If project hasn't started yet
        if today < self.start_date:
            return 0.0
        
        # If project is past end date
        if today > self.end_date:
            return 100.0
        
        # Calculate days
        total_days = (self.end_date - self.start_date).days
        elapsed_days = (today - self.start_date).days
        
        # Avoid division by zero
        if total_days == 0:
            return 0.0
        
        # Calculate percentage (capped at 100)
        progress = (elapsed_days / total_days) * 100
        return min(progress, 100.0)
    
    @property
    def duration_days(self) -> int:
        """Total duration of the project in days."""
        return (self.end_date - self.start_date).days
