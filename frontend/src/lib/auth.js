const KEY = "dormming.token";
const BASE = import.meta.env.VITE_API_URL ?? `http://${location.hostname}:8080`;

function store(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const getToken = () => store(() => localStorage.getItem(KEY), null);
export const isLoggedIn = () => Boolean(getToken());
export const logOut = () => store(() => localStorage.removeItem(KEY));
const saveToken = (token) => store(() => localStorage.setItem(KEY, token));

async function post(path, body) {
  const res = await fetch(`${BASE}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Try again.");
  return data;
}

export async function signUp({ email, password, displayName }) {
  const data = await post("register", { email, password, displayName });
  saveToken(data.token);
  return data.user;
}

export async function logIn({ email, password }) {
  const data = await post("login", { email, password });
  saveToken(data.token);
  return data.user;
}


export { BASE };
