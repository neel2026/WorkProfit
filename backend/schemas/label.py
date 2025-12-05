from pydantic import BaseModel
from typing import List, Optional

class LabelBase(BaseModel):
    name: str
    color: str = "#3B82F6"  # Default blue

class LabelCreate(LabelBase):
    pass

class LabelUpdate(BaseModel):
    name: str | None = None
    color: str | None = None

class LabelResponse(LabelBase):
    id: int
    
    class Config:
        from_attributes = True
