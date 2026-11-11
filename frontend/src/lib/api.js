import { BASE, getToken, logOut } from "./auth";

/** Calls the DormMing API. Throws Error(message) on failure; a 401 logs out and goes to /login. */
export async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach DormMing. Is the server running?");
  }
  if (res.status === 401) {
    logOut();
    if (location.pathname !== "/login") location.assign("/login");
    throw new Error("Please log in again");
  }
  if (res.status === 204 || res.status === 201) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Try again.");
  return data;
}
