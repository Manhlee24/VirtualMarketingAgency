from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    
    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message:str
class TokenLogin(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message:str
    name:str

class TokenData(BaseModel):
    user_id: Optional[int] = None
