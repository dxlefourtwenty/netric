import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from pymongo import MongoClient

load_dotenv()

user = os.environ["MONGO_USER"]
pw = quote_plus(os.environ["MONGO_PASS"])
cluster = os.environ["MONGO_CLUSTER"]

uri = f"mongodb+srv://{user}:{pw}@{cluster}/netric?retryWrites=true&w=majority"

client = MongoClient(uri)

db = client["netric"]
users_collection = db["users"]

try:
    client.admin.command("ping")
    print("✅ MongoDB connected")
except Exception as e:
    print("❌ MongoDB connection failed:", e)
