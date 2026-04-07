const PLAYER_SUMMARY_CACHE_TTL = 1000 * 60 * 30
const PLAYER_SUMMARY_CACHE_VERSION = 2

export function getPlayerSummaryCacheKey(playerId) {
  return `netric:player-summary:${playerId}`
}

export function readPlayerSummaryCache(playerId) {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawCache = window.localStorage.getItem(getPlayerSummaryCacheKey(playerId))

    if (!rawCache) {
      return null
    }

    const parsedCache = JSON.parse(rawCache)

    if (
      !parsedCache?.timestamp ||
      parsedCache.version !== PLAYER_SUMMARY_CACHE_VERSION ||
      Date.now() - parsedCache.timestamp > PLAYER_SUMMARY_CACHE_TTL
    ) {
      window.localStorage.removeItem(getPlayerSummaryCacheKey(playerId))
      return null
    }

    return parsedCache.data ?? null
  } catch (error) {
    console.error("Failed to read player summary cache", error)
    return null
  }
}

export function writePlayerSummaryCache(playerId, summary) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(
      getPlayerSummaryCacheKey(playerId),
      JSON.stringify({
        timestamp: Date.now(),
        version: PLAYER_SUMMARY_CACHE_VERSION,
        data: summary,
      })
    )
  } catch (error) {
    console.error("Failed to write player summary cache", error)
  }
}

export function clearPlayerSummaryCache(playerId) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(getPlayerSummaryCacheKey(playerId))
}
