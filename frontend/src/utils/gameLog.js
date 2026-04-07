export function formatGameLogNumber(value, decimals = 1, fallback = "0.0") {
  if (value == null || Number.isNaN(Number(value))) {
    return fallback
  }

  return Number(value).toFixed(decimals)
}

export function formatGameLogPct(value, decimals = 1) {
  if (value == null || Number.isNaN(Number(value))) {
    return "0.0"
  }

  return Number(Number(value) * 100).toFixed(decimals)
}

export function formatSignedGameLogNumber(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "0"
  }

  return Number(value) > 0 ? `+${Number(value)}` : `${Number(value)}`
}

export function getGameLogKey(game, index = 0) {
  if (game?.game_id) {
    return String(game.game_id)
  }

  return [game?.game_date || game?.date || "game", index].join("-")
}

export function findGameLogByKey(games, targetKey) {
  if (!Array.isArray(games) || !targetKey) {
    return null
  }

  return (
    games.find((game, index) => getGameLogKey(game, index) === targetKey) ||
    null
  )
}
