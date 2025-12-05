from pydantic import BaseModel, EmailStr, model_validator
from typing import Literal
from datetime import datetime

# Define allowed roles as Literal type for strict validation
UserRoleType = Literal["ADMIN", "PROJECT_MANAGER", "TEAM_LEAD", "STAFF", "CLIENT"]
DepartmentType = Literal["ACCOUNT", "SALES", "MARKETING", "QA", "DEVELOPER", "SUPPORT", "HR"]

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone_number: str | None = None
    role: UserRoleType
    department: DepartmentType | None = None
    
    @model_validator(mode='after')
    def validate_department_for_staff(self):
        """
        Business Rule: STAFF, TEAM_LEAD, and PROJECT_MANAGER must have a department.
        ADMIN and CLIENT do not require a department.
        """
        roles_requiring_department = ["STAFF", "TEAM_LEAD", "PROJECT_MANAGER"]
        
        if self.role in roles_requiring_department and not self.department:
            raise ValueError(
                f"Department is required for role '{self.role}'. "
                f"Staff members must be assigned to a department."
            )
        
        return self

    @model_validator(mode='after')
    def validate_password_strength(self):
        """
        Basic password policy: at least 8 chars, with upper, lower, digit, and special.
        """
        pwd = self.password or ""
        if (
            len(pwd) < 8
            or not any(c.islower() for c in pwd)
            or not any(c.isupper() for c in pwd)
            or not any(c.isdigit() for c in pwd)
            or not any(c in "!@#$%^&*()-_=+[]{}|;:,.<>?/~`" for c in pwd)
        ):
            raise ValueError(
                "Password must be at least 8 characters and include upper, lower, digit, and special character."
            )
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    role: UserRoleType | None = None
    department: DepartmentType | None = None
    is_active: bool | None = None
    
    @model_validator(mode='after')
    def validate_department_for_staff_update(self):
        """
        Business Rule: If updating role to STAFF/TEAM_LEAD/PROJECT_MANAGER,
        department must be provided in the same update.
        """
        roles_requiring_department = ["STAFF", "TEAM_LEAD", "PROJECT_MANAGER"]
        
        # Only validate if role is being updated
        if self.role and self.role in roles_requiring_department:
            if not self.department:
                raise ValueError(
                    f"Department must be provided when updating role to '{self.role}'. "
                    f"Staff members must be assigned to a department."
                )
        
        return self

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    department: str | None
    is_active: bool
    last_login: datetime | None = None
    
    class Config:
        from_attributes = True
