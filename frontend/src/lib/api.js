import { BASE, getToken, logOut } from "./auth";
import { clearPasscode } from "./passcode";

/** Calls the DormMing API. Throws Error(message) on failure; a 401 logs out and goes to /login.
 *  When the server can't be reached at all, the error has unreachable: true, so screens can show the offline page. */
export async function api(path, { method = "GET", body, keepalive = false } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: body === undefined ? undefined : JSON.stringify(body),
      keepalive, // lets a request finish even while the page is closing
    });
  } catch {
    throw Object.assign(new Error("Can't reach DormMing. Check your connection and try again."), { unreachable: true });
  }
  if (res.status === 401) {
    logOut();
    clearPasscode(); // the PIN belongs to this login, not to the next person who logs in here
    if (location.pathname !== "/login") location.assign("/login");
    throw new Error("Please log in again");
  }
  if (res.status === 204 || res.status === 201) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Try again.");
  return data;
}
