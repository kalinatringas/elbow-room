# All libs that are needed
from fastapi import FastAPI, HTTPException, Header, Depends, UploadFile, File, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client, Client
from typing import Optional, List, Generic, TypeVar
from dotenv import load_dotenv
from datetime import datetime
from uuid import UUID
import os, io
from PIL import Image
from math import ceil

# Gets the .env for the keys
load_dotenv(dotenv_path=".env")


supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)
supabase_admin: Client = create_client(supabase_url, supabase_service_key)  
app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/octet-stream"}
MAX_SIZE_MB = 2 # should be same in supabase storage bucket 

def get_current_user(credentials : HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

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

#pagination model
class CursorPagination(BaseModel):
    items: List[PostResponse]
    next_cursor: Optional[str]

@app.get("/")
def root():
    return{"Message": "hi there"}

@app.post("/posts/", response_model=PostResponse)
def request_post(post: PostRequest = Body(...), user=Depends(get_current_user)):
    data = {
        "author_id": str(user.id),
        "content": post.content,
        "created_at": datetime.utcnow().isoformat()
    }
    response = supabase_admin.table("posts").insert(data).execute()
    return response.data[0]
 
# get a single user by ID
@app.get("/user/{user_id}", status_code=200)
def get_user(user_id: str):
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]

# getting posts and implementing cursor pagination
@app.get("/posts", response_model=CursorPagination)
def get_posts(
    cursor: Optional[str] = Query(None, description="Fetch posts created before this timestamp"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to fetch"),
    user=Depends(get_current_user),
):
    query = supabase.table("posts") \
        .select("*, post_like(user_id)") \
        .order("created_at", desc=True) \
        .is_("deleted_at", None)

    if cursor:
        query = query.lt("created_at", cursor)

    response = query.limit(limit).execute()

    if not response.data:
        return {"items": [], "next_cursor": None}

    posts = response.data

    for post in posts:
        likes = post.get("post_likes", [])
        post["like_count"] = len(likes)
        post["liked_by_me"] = any(
            l["user_id"] == str(user.id) for l in likes
        )

    last_post = posts[-1]
    next_cursor = last_post["created_at"]

    return {"items": posts, "next_cursor": next_cursor}

@app.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user = Depends(get_current_user),
):
    print("filename:", file.filename)
    print("content_type:", file.content_type)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type: only JPEG, PNG, and WEBP allowed")
    
    contents = await file.read()
    print("size:", len(contents))

    # checking if file bigger than 2mb
    if (len(contents) > MAX_SIZE_MB * 1024 * 1024):
        raise HTTPException(status_code=400, detail="File size too big!")
    try:
        image = Image.open(io.BytesIO(contents))
        image = image.convert("RGB")
        image = image.resize((256,256), Image.LANCZOS)

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        buffer.seek(0)
    except Exception as e:
        print("Image processing error", e)
        raise HTTPException(status_code=500, detail=f"image processing failed: {str(e)}")

    try:
        file_path = f'{user.id}/avatar.jpeg'
        supabase_admin.storage.from_("avatars").upload(
        path=file_path,
        file=buffer.read(),
        file_options={"content-type": "image/jpeg", "upsert": "true"},
        )
    except Exception as e:
        print("Image upload error", e)
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    public_url = supabase.storage.from_('avatars').get_public_url(file_path)
    supabase.table("profiles").update({"avatar_url":public_url}).eq("id", user.id).execute()

    return {"avatar_url": public_url}

@app.get("/users/{user_id}/posts", response_model=CursorPagination)
def get_user_post(
    user_id: str,
    cursor: Optional[str] = Query(None, description="Fetch posts after this post ID"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to fetch"),
    user=Depends(get_current_user),
):
    searched_user = get_user(user_id)

    query = supabase.table("posts") \
        .select("*, post_likes(user_id)") \
        .eq('author_id', user_id) \
        .order("created_at", desc=True) \
        .is_("deleted_at", None)

    if cursor:
        query = query.lt("created_at", cursor)

    response = query.limit(limit).execute()

    if not response.data:
        return {"items": [], "next_cursor": None}

    posts = response.data
    has_more = len(posts) > limit

    for post in posts:
        likes = post.get("post_likes", [])
        post["like_count"] = len(likes)
        post["liked_by_me"] = any(
            l["user_id"] == str(user.id) for l in likes
        )

    next_cursor = posts[-1]["created_at"] if has_more else None

    return {"items": posts, "next_cursor": next_cursor}

