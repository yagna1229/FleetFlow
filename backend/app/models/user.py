from sqlalchemy import Column,Integer,String,Boolean,Float
from app.config.database import Base 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,index=True)
    email = Column(String,unique=True,index=True)
    username = Column(String,nullable=True)
    hashed_password = Column(String,nullable=True)
    is_google_user = Column(Boolean,default=False)