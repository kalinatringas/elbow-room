# Elbow Room - Full Stack Social Media App

Frontend is built with **Vite + TypeScript**, backend will use **FastAPI**, and data is managed with **PostgreSQL via Supabase**.

---

## Tech Stack

### Frontend
- Vite
- TypeScript
- npm

### Backend (Planned)
- Python
- FastAPI
- PostgreSQL

### Database
- Supabase (Cloud-hosted PostgreSQL)

---

##  Project Structure

project-root/
│
├── frontend/ # Frontend (Vite + TypeScript)
│ ├── src/
│ ├── package.json
│ └── vite.config.ts
│
├── backend/ # Backend (FastAPI - planned)
│ ├── main.py
│ └── requirements.txt
│
└── README.md

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (recommended: latest LTS version)
- npm
- Python (recommended: 3.10+)
- 
---

## Frontend Setup

### Navigate to the frontend folder

```bash
cd frontend
```
### Install dependencies
```bash
npm install
```
### Create environment file

Create a .env file inside frontend/:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
You can find these in your Supabase dashboard:
Project Settings → API

###  Start development server
```bash
npm run dev
```

Frontend will run on:

http://localhost:5173

## Backend Setup (FastAPI – Planned)

⚠️ Backend setup assumes FastAPI will be used.

### Navigate to backend folder
```bash
cd backend
```
### Create virtual environment (recommended)
```bash
python -m venv venv
```

# Project Setup Guide

## Activate Virtual Environment

**Mac/Linux**
```bash
source venv/bin/activate
```

**Windows**
```bash
venv\Scripts\activate
```

---

## Install Dependencies

Once `requirements.txt` exists:

```bash
pip install -r requirements.txt
```

Expected packages will likely include:

- `fastapi`
- `uvicorn`
- `psycopg2` or `asyncpg`
- `python-dotenv`

---

## Create Backend `.env`

Inside `be/`, create a `.env` file:

```env
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

> ⚠️ **Never commit `.env` files to GitHub.**

---

## Run Backend

```bash
uvicorn main:app --reload --port 8000
```

Backend will run on: `http://localhost:8000`

---

## Connecting Frontend & Backend

Once backend is running:

- **Frontend** → `5173`
- **Backend** → `8000`

You will need to enable CORS in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> Without this, requests will fail.

---

## Supabase Setup

1. Create a project on [Supabase](https://supabase.com) (cloud).
2. Copy the following:
   - Project URL
   - Anon public key
   - Database connection string
3. Add them to their respective `.env` files.

---

## Development Workflow

**Run Frontend**
```bash
cd fe
npm run dev
```

**Run Backend**
```bash
cd be
uvicorn main:app --reload --port 8000
```

> Make sure both are running at the same time.

---

## Common Issues

### ❌ CORS Errors
Make sure FastAPI CORS middleware includes `http://localhost:5173`.

### ❌ Environment Variables Not Loading
- Ensure `.env` is in the correct folder.
- Restart the dev server after changes.

### ❌ Supabase Connection Issues
- Double-check the database URL.
- Make sure the project is not paused.

---

## For New Developers

If you're new:

1. Start with frontend only (`frontend/`).
2. Confirm Supabase connection works.
3. Then set up backend.
4. Run both servers simultaneously.
