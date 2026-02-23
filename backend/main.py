from fastapi import FastAPI
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware
from models import AuthRequest
from auth import register_user, login_user, get_user_favorites, add_favorite_player, remove_favorite_player
from nba import search_player_stats, get_player_summary

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

@app.delete("/favorites/player/{player_id}")
def delete_favorite_player(player_id: int, authorization: str = Header(None)):
    return remove_favorite_player(player_id, authorization)

@app.get("/player/{player_id}/summary")
def player_summary(player_id: int):
    return get_player_summary(player_id)

@app.get("/player/{player_id}/full")
def player_full(player_id: int):
    return get_player_full(player_id)

@app.delete("/debug/clear-player-cache/{player_id}")
def clear_player_cache(player_id: int):
    player_cache.delete_one({"player_id": player_id})
    return {"message": "Cache cleared"}
