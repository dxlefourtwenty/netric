import axios from "axios"

export default function PlayerCard({ stats, playerId, playerName }) {

  const token = localStorage.getItem("token")

  const currentSeason = stats[stats.length - 1]
  const totalPoints = stats.reduce((sum, s) => sum + s.PTS, 0)

  const handleFavorite = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/favorite/players",
        { id: playerId, name: playerName },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      alert("Favorited!")
    } catch (err) {
      console.error(err)
      alert("Error favoriting player")
    }
  }

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Career Overview</h2>

      <p>Total Career Points: {totalPoints}</p>

      <h3 className="mt-4 font-semibold">Current Season</h3>
      <p>Season: {currentSeason.SEASON_ID}</p>
      <p>PTS: {currentSeason.PTS}</p>
      <p>AST: {currentSeason.AST}</p>
      <p>REB: {currentSeason.REB}</p>

      <button
        onClick={handleFavorite}
        className="mt-4 bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400"
      >
        Favorite
      </button>
    </div>
  )
}
