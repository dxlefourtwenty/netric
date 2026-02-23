from fastapi import FastAPI
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware
from models import AuthRequest
from auth import register_user, login_user, get_user_favorites, add_favorite_player
from nba import search_player_stats

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search/players/{name}")
def search_player(name: str):
    return search_player_stats(name)

@app.post("/register")
def register(data: AuthRequest):
    return register_user(data)

@app.post("/login")
def login(data: AuthRequest):
    return login_user(data)

@app.get("/favorites")
def favorites(authorization: str = Header(None)):
    return get_user_favorites(authorization)

@app.post("/favorite/players")
def favorite_player(data: dict, authorization: str = Header(None)):
    return add_favorite_player(data, authorization)
