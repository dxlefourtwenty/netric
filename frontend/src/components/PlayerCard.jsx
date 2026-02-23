import axios from "axios"

export default function PlayerCard({
  player_id,
  name,
  season,
  season_stats,
  last_game,
  headshot_url
}) {

  const token = localStorage.getItem("token")
  const API_BASE = import.meta.env.VITE_API_BASE

  const handleFavorite = async () => {
    try {
      await axios.post(
        `${API_BASE}/favorite/players`,
        { id: player_id, name },
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

  if (!season_stats) return null

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{name}</h2>

      <img
        src={headshot_url}
        alt={name}
        className="w-48 mb-4 rounded"
      />

      <h3 className="font-semibold">Season: {season}</h3>
      <p>PTS: {season_stats.pts}</p>
      <p>AST: {season_stats.ast}</p>
      <p>REB: {season_stats.reb}</p>
      <p>FG%: {(season_stats.fg_pct * 100).toFixed(1)}%</p>

      {last_game && (
        <>
          <h3 className="mt-4 font-semibold">Last Game</h3>
          <p>{last_game.matchup}</p>
          <p>{last_game.date}</p>
          <p>PTS: {last_game.pts}</p>
        </>
      )}

      <button
        onClick={handleFavorite}
        className="mt-4 bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400"
      >
        Favorite
      </button>
    </div>
  )
}
