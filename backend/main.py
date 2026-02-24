from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import AuthRequest
from auth import (
    register_user,
    login_user,
    get_user_favorites,
    add_favorite_player,
    remove_favorite_player
)

from database import db

app = FastAPI()

# Mongo collection
player_cache = db["player_cache"]
fetch_queue = db["fetch_queue"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from nba import search_player_stats, build_player_summary

@app.get("/search/players/{name}")
def search_player(name: str):
    return search_player_stats(name)

# ---------------------------
# AUTH
# ---------------------------

@app.post("/register")
def register(data: AuthRequest):
    return register_user(data)

@app.post("/login")
def login(data: AuthRequest):
    return login_user(data)

# ---------------------------
# FAVORITES
# ---------------------------

@app.get("/favorites")
def favorites(authorization: str = Header(None)):
    return get_user_favorites(authorization)

@app.post("/favorite/players")
def favorite_player(data: dict, authorization: str = Header(None)):
    return add_favorite_player(data, authorization)

@app.delete("/favorites/player/{player_id}")
def delete_favorite_player(player_id: int, authorization: str = Header(None)):
    return remove_favorite_player(player_id, authorization)

# ---------------------------
# SUMMARY (CACHE ONLY)
# ---------------------------

@app.get("/player/{player_id}/summary")
def get_player_summary(player_id: int):
    cached = player_cache.find_one({"player_id": player_id})

    if not cached:
        fetch_queue.update_one(
            {"player_id": player_id},
            {"$set": {"player_id": player_id}},
            upsert=True
        )
        raise HTTPException(
            status_code=404,
            detail="Player not cached yet. Fetch scheduled."
        )

    return build_player_summary(player_id)

# ---------------------------
# DEBUG
# ---------------------------

@app.delete("/debug/clear-player-cache/{player_id}")
def clear_player_cache(player_id: int):
    player_cache.delete_one({"player_id": player_id})
    return {"message": "Cache cleared"}
