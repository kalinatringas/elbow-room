# All libs that are needed
from fastapi import FastAPI, HTTPException, Header, Depends, UploadFile, File, Body, Query, Form
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
    like_count: int 
    liked_by_me: bool 
    profiles: Optional[dict] 
    

#pagination model
class CursorPagination(BaseModel):
    items: List[PostResponse]
    next_cursor: Optional[str]


class UpdateUser(BaseModel):
    username: str
    bio: str
    name: str

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
@app.get("/posts/")
def get_posts(
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user)
):
    try:
        # 🔹 Base feed query (FAST now)
        query = supabase.table("posts")\
            .select("""
                id,
                author_id,
                content,
                created_at,
                like_count,
                profiles!posts_author_id_fkey(username, avatar_url)
                post_likes!post_likes_user_id_fkey(user_id)
            """)\
            .is_("deleted_at", None)\
            .order("created_at", desc=True)

        if cursor:
            query = query.lt("created_at", cursor)  

        posts_resp = query.limit(limit + 1).execute()

        if not posts_resp.data:
            return {"items": [], "next_cursor": None}

        posts = posts_resp.data[:limit]
        has_more = len(posts_resp.data) > limit

        post_ids = [p["id"] for p in posts]

        like_resp = supabase_admin.table("post_likes")\
        .select("post_id")\
        .eq("user_id", user.id)\
        .in_("post_id", post_ids)\
        .execute()
        
        liked_post_ids = {str(like["post_id"]) for like in like_resp.data}

        for post in posts:
            post["liked_by_me"] = str(post["id"]) in liked_post_ids
    

        next_cursor = posts[-1]["created_at"] if has_more else None

        return {"items": posts, "next_cursor": next_cursor}

    except Exception as e:
        print("get_posts error:", e)
        raise HTTPException(status_code=500, detail=str(e))

async def process_and_upload_avatar(
    file: UploadFile,
    user_id: str,   
)->str:

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type: only JPEG, PNG, and WEBP allowed")
    
    contents = await file.read()

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
        file_path = f'{user_id}/avatar.jpeg'
        supabase_admin.storage.from_("avatars").upload(
        path=file_path,
        file=buffer.read(),
        file_options={"content-type": "image/jpeg", "upsert": "true"},
        )
    except Exception as e:
        print("Image upload error", e)
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    public_url = supabase.storage.from_('avatars').get_public_url(file_path)
    supabase.table("profiles").update({"avatar_url":public_url}).eq("id", user_id).execute()

    return public_url
@app.post("/upload-avatar")
async def upload_avatar_route(file:UploadFile = File(...),
                              user = Depends(get_current_user)):
    url = await process_and_upload_avatar(file, user.id)
    supabase.table("profiles").update({"avatar_url": url}).eq("id", user.id).execute()
    return {"avatar_url": url}


@app.patch("/users/me")
async def update_user(username: str = Form(None),
                      bio: str = Form(None),
                      name: str = Form(None), 
                      file: UploadFile = File(None), 
                      user=Depends(get_current_user)):
    
    try:
        updates = {}

        # i used form fields here instead of a pydantic model since we have bote files + text fields (Upload avatar)
        
        if username is not None: 
            updates["username"] = username
        if bio is not None:
            updates["bio"] = bio
        if name is not None:
            updates["name"] = name

        if file is not None:
            avatar_url = await process_and_upload_avatar(file, user_id = user.id)
            updates["avatar_url"] = avatar_url

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = supabase_admin.table("profiles").update(updates).eq("id", user.id).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Update failed")
        return result.data[0]
    except Exception as e:
        print ("update_user error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/posts/me/")
def get_my_posts(
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user)
):
    try:
        query = supabase_admin.table("posts")\
            .select("""
                id,
                author_id,
                content,
                created_at,
                like_count,
                profiles!posts_author_id_fkey(username, avatar_url)
            """)\
            .eq("author_id", str(user.id))\
            .is_("deleted_at", None)\
            .order("created_at", desc=True)

        if cursor:
            query = query.lt("created_at", cursor)

        posts_resp = query.limit(limit + 1).execute()

        if not posts_resp.data:
            return {"items": [], "next_cursor": None}

        posts = posts_resp.data[:limit]
        has_more = len(posts_resp.data) > limit

        post_ids = [p["id"] for p in posts]

        likes_resp = supabase_admin.table("post_likes")\
            .select("post_id")\
            .eq("user_id", str(user.id))\
            .in_("post_id", post_ids)\
            .execute()

        liked_post_ids = {str(like["post_id"]) for like in likes_resp.data}

        for post in posts:
            post["liked_by_me"] = str(post["id"]) in liked_post_ids

        next_cursor = posts[-1]["created_at"] if has_more else None

        return {"items": posts, "next_cursor": next_cursor}

    except Exception as e:
        print("get_my_posts error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/posts/{post_id}/like')
def toggle_like(post_id: str, user=Depends(get_current_user)):
    user_id = str(user.id)
    try: 
        existing = supabase_admin.table("post_likes")\
        .select("*")\
        .eq("post_id", post_id)\
        .eq("user_id", user_id)\
        .execute()
        if existing.data:
            #unlike
            supabase_admin.table("post_likes")\
            .delete()\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()
            liked = False
        else:
            supabase_admin.table("post_likes")\
            .insert({"post_id":post_id, "user_id":user_id})\
            .execute()
            liked = True
        count_resp = supabase_admin.table("post_likes")\
        .select("*",count="exact")\
        .eq("post_id", post_id)\
        .execute()
        new_count = count_resp.count or 0
        supabase_admin.table("posts") \
        .update({"like_count": new_count}) \
        .eq("id", post_id) \
        .execute()

        return {"liked":liked, "like_count": new_count}
    except Exception as e:
        print("toggle_like error: ", e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/tags/{tag_id}/posts", response_model=CursorPagination)
def get_tag_post(
    tag_id: str,
    cursor: Optional[str] = Query(None, description="Fetch posts created with this tag"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to fetch"),
    user=Depends(get_current_user),
):
    tag_response = supabase.table("tags").select("*").eq("id", tag_id).execute()
    if not tag_response.data:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    query = supabase.table("post_tags") \
        .select("post_id, posts(*, post_likes(user_id))") \
        .eq("tag_id", tag_id) \
        .order("posts.created_at", desc=True)
    
    if cursor:
        query = query.lt("posts.created_at", cursor)

    response = query.limit(limit).execute()

    if not response.data:
        return {"items": [], "next_cursor": None}
    
    posts = [item["posts"] for item in response.data if item.get("posts")]
    
    for post in posts:
        likes = post.get("post_likes", [])
        post["like_count"] = len(likes)
        post["liked_by_me"] = any(l["user_id"] == str(user.id) for l in likes)

    next_cursor = posts[-1]["created_at"] if posts else None

    return {"items": posts, "next_cursor": next_cursor}

@app.get('search/users')
def search_users(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    user= Depends(get_current_user)
):
    response = supabase.table("profiles")\
    .select("id, username, name, avatar_url")\
    .ilike("username", f"%{q}%") \
    .limit(limit)\
    .execute()
    return response.data

@app.get('search/posts')
def search_posts(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    user= Depends(get_current_user)
):
    response = supabase.table("posts")\
    .select("*")\
    .ilike("content", f"%{q}%") \
    .is_("deleted_at", None)\
    .limit(limit)\
    .execute()
    return response.data

@app.get('search/tags')
def search_posts(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    user= Depends(get_current_user)
):
    response = supabase.table("tags")\
    .select("*")\
    .ilike("name", f"%{q}%") \
    .limit(limit)\
    .execute()
    return response.data