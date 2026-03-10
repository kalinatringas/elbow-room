# All libs that are needed
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from supabase import create_client, Client
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime
from uuid import UUID
import os

# Gets the .env for the keys
load_dotenv()

# Actually grabs the keys
print("URL:", os.getenv("SUPABASE_URL"))
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

# Creating base models for the posts
# Request model
class PostRequest(BaseModel):
    # user only needs to input content
    content: str

# Response model
class PostResponse(BaseModel):
    id: UUID
    author_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime

@app.get("/")
def root():
    return{"Message": "hi there"}

@app.post("/posts/", response_model=PostResponse)
def request_post(post: PostRequest):
    author_id = get_user()
    data = {
        "author_id": str(author_id),
        "content": post.content,
        "created_at": datetime.utcnow()
    }
    response = supabase.table("posts").insert(data).execute()
    return response.data[0]

# get a single user by ID
@app.get("/user/{user_id}", status_code=201)
def get_user(id: str):
    response = supabase.table("profiles").select("*").eq("id". id).execute()
    if not response.data:
        return HTTPException(status_code=404, detail="User not found")
    return response.data[0]

# getting posts
@app.get("/posts/")
def get_posts():
    response = supabase.table("posts").select("*").execute()
    return response.data