export function getToken() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem("token")
}

export function isAuthenticated() {
  return Boolean(getToken())
}
