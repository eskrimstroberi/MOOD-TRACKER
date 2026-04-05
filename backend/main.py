from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import uuid
from enum import Enum

app = FastAPI(
    title="Mood Tracker API",
    version="1.0",
    openapi_tags=[
        {"name": "Auth"},
        {"name": "Moods"}
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
active_tokens = []

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")

class MoodType(str, Enum):
    senang = "senang"
    sedih = "sedih"
    marah = "marah"
    capek = "capek"
    semangat = "semangat"
    santai = "santai"

class Mood(BaseModel):
    id: Optional[str] = None
    nama: str
    mood: MoodType
    catatan: Optional[str] = None
    tanggal: date

class Login(BaseModel):
    username: str
    password: str

database_moods: List[Mood] = []

@app.get("/")
def root():
    return {"message": "Mood Tracker API 😊"}

@app.post("/api/login", tags=["Auth"])
def login(user: Login):
    if user.username and user.password:
        token = str(uuid.uuid4())
        active_tokens.append(token)

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    raise HTTPException(status_code=401, detail="Login gagal")

@app.post("/api/moods", tags=["Moods"])
def create_mood(data: Mood, _: None = Depends(verify_token)):
    data.id = str(uuid.uuid4())
    database_moods.append(data)

    return {
        "message": "Mood berhasil ditambahkan",
        "data": data
    }


@app.get("/api/moods", response_model=List[Mood], tags=["Moods"])
def get_moods(_: None = Depends(verify_token)):
    return database_moods

@app.put("/api/moods/{mood_id}", tags=["Moods"])
def update_mood(mood_id: str, updated: Mood, _: None = Depends(verify_token)):
    for i, mood in enumerate(database_moods):
        if mood.id == mood_id:
            updated.id = mood_id
            database_moods[i] = updated
            return {
                "message": "Mood berhasil diupdate",
                "data": updated
            }

    raise HTTPException(status_code=404, detail="Mood not found")


@app.delete("/api/moods/{mood_id}", tags=["Moods"])
def delete_mood(mood_id: str, _: None = Depends(verify_token)):
    for i, mood in enumerate(database_moods):
        if mood.id == mood_id:
            deleted = database_moods.pop(i)
            return {
                "message": "Mood berhasil dihapus",
                "data": deleted
            }

    raise HTTPException(status_code=404, detail="Mood not found")


@app.get("/health")
def health():
    return {"status": "OK"}