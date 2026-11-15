const KEY = "dormming.theme";
const dark = matchMedia("(prefers-color-scheme: dark)");

/** "light" | "dark" | "system", remembered on this device. */
export const getTheme = () => { try { return localStorage.getItem(KEY) ?? "system"; } catch { return "system"; } };

function apply() {
  const t = getTheme();
  document.documentElement.classList.toggle("dark", t === "dark" || (t === "system" && dark.matches));
}

export function setTheme(t) {
  try { localStorage.setItem(KEY, t); } catch { /* private mode: lasts this visit */ }
  apply();
}

dark.addEventListener("change", apply);
apply();
