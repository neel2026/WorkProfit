from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# Association table for Task-Label many-to-many relationship
task_labels = Table(
    'task_labels',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id', ondelete="CASCADE"), primary_key=True),
    Column('label_id', Integer, ForeignKey('labels.id', ondelete="CASCADE"), primary_key=True)
)

class Label(Base):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    color = Column(String, default="#3B82F6")  # Default blue
    
    # Relationship
    tasks = relationship("Task", secondary=task_labels, back_populates="labels")
