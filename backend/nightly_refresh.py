from refresh_db import refresh_all_players
from fetch_worker import run_queue


def main():
    print("Nightly refresh started.")
    refresh_all_players()

    total_processed = 0

    while True:
        processed = run_queue()
        total_processed += processed

        if processed == 0:
            break

    print(f"Nightly refresh finished. Total processed: {total_processed}")


if __name__ == "__main__":
    main()
