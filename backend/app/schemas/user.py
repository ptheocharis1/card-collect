from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    is_active: bool
    is_superuser: bool
    created_at: datetime