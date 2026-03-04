from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
import datetime

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

class Posts(BaseModel):
    author_id: str
    content: str
    created_at: datetime
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