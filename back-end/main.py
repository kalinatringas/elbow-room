from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from supabase import create_client, Client
import os
import datetime
from typing import Optional
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

class Posts(BaseModel):
    author_id: str
    content: str
    created_at: datetime
# post function for posts (glup)
@app.post("/post/", status_code=201)
def create_post(post: Posts):
    try: 
        response = supabase.table("posts").insert(post.model_dump()).execute()
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create posting data in supabase")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class User(BaseModel):
    name: str
    username: str
    bio: Optional[str]
   # created_at: datetime
@app.post("/user/", status_code = 201)
def add_user(user: User, authorization: str = Header(None)):
    data = user.model_dump()
    data["created_at"] = datetime.datetime.now(datetime.timezone.utc)
    try:
        response = supabase.table("profiles").insert(data).execute()
        if response.data:
            return response.data[0]
        else:
            return HTTPException(status_code=500, detail="Failed to create user in supabase")
    except Exception as e: 
        raise HTTPException(status_code=500, detail=str(e))
    
# get a single user by ID
@app.get("/user/{user_id}", status_code=201)
def get_user(id: str):
    response = supabase.table("profiles").select("*").eq("id", id).execute()
    if not response.data:
        return HTTPException(status_code=404, detail="User not found")
    return response.data[0]

# # get all users
# @app.get("/user/", response_model=list[User])
# def get_users():
#     response = 