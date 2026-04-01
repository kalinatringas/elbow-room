# Elbow Room - Full Stack Social Media App

Frontend is built with **Expo + TypeScript**, backend will use **FastAPI**, and data is managed with **PostgreSQL via Supabase**.

---

## Tech Stack

### Frontend
- React Native Expo
- TypeScript
- npm

### Backend
- Python
- FastAPI
- PostgreSQL

### Database
- Supabase (Cloud-hosted PostgreSQL)

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (recommended: latest LTS version)
- npm
- Python (recommended: 3.10+)
---

## Frontend Setup

### Navigate to the frontend folder

```bash
cd front-end
```
### Install dependencies
```bash
npm install
```
### Create environment file

Create a .env file inside frontend/:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
!!! Put this file in your .gitignore file!

You can find these in your Supabase dashboard:
Project Settings → API

###  Start development server
```bash
npx expo start
```

Frontend will run on:

http://localhost:8081

## Backend Setup (FastAPI – Planned)

⚠️ Backend setup assumes FastAPI will be used.

### Navigate to backend folder
```bash
cd back-end
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
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
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

- **Frontend** → `8081`
- **Backend** → `8000`


## Development Workflow

**Run Frontend**
```bash
cd fe
npx expo start
```

**Run Backend**
```bash
cd be
uvicorn main:app --reload --port 8000
```

> Make sure both are running at the same time.

## For New Developers

If you're new:

1. Start with frontend only (`front-end/`).
2. Confirm Supabase connection works.
3. Then set up backend.
4. Run both servers simultaneously.
