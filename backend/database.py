import os
import time
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

user = os.environ["MONGO_USER"]
pw = quote_plus(os.environ["MONGO_PASS"])
cluster = os.environ["MONGO_CLUSTER"]

uri = f"mongodb+srv://{user}:{pw}@{cluster}/netric?retryWrites=true&w=majority"

connect_timeout_ms = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "5000"))
server_selection_timeout_ms = int(
    os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "15000")
)
init_retries = int(os.getenv("MONGO_INIT_RETRIES", "12"))
retry_delay_seconds = float(os.getenv("MONGO_INIT_RETRY_DELAY_SECONDS", "10"))


def _connect_with_retry():
    last_error = None

    for attempt in range(1, init_retries + 1):
        try:
            client = MongoClient(
                uri,
                connectTimeoutMS=connect_timeout_ms,
                serverSelectionTimeoutMS=server_selection_timeout_ms,
            )
            client.admin.command("ping")
            print(f"MongoDB connected on attempt {attempt}.")
            return client
        except Exception as exc:
            last_error = exc
            print(
                f"MongoDB connection attempt {attempt}/{init_retries} failed: {exc}"
            )
            if attempt == init_retries:
                break
            time.sleep(retry_delay_seconds)

    raise last_error


client = _connect_with_retry()

db = client["netric"]
users_collection = db["users"]
