export default function PlayerCard({ stats }) {

  const currentSeason = stats[stats.length - 1]

  const totalPoints = stats.reduce((sum, s) => sum + s.PTS, 0)

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Career Overview</h2>

      <p>Total Career Points: {totalPoints}</p>

      <h3 className="mt-4 font-semibold">Current Season</h3>
      <p>Season: {currentSeason.SEASON_ID}</p>
      <p>PTS: {currentSeason.PTS}</p>
      <p>AST: {currentSeason.AST}</p>
      <p>REB: {currentSeason.REB}</p>
    </div>
  )
}
