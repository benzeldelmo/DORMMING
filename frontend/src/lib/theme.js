const THEME = "dormming.theme";
const MOTION = "dormming.reduceMotion";
const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: setting lasts this visit */ } };
const dark = matchMedia("(prefers-color-scheme: dark)");

/** "light" | "dark" | "system", remembered on this device. */
export const getTheme = () => read(THEME, "system");
export const getReduceMotion = () => read(MOTION, "false") === "true";

function apply() {
  const t = getTheme();
  document.documentElement.classList.toggle("dark", t === "dark" || (t === "system" && dark.matches));
  document.documentElement.classList.toggle("reduce-motion", getReduceMotion());
}

export function setTheme(t) { write(THEME, t); apply(); }
export function setReduceMotion(on) { write(MOTION, String(on)); apply(); }

dark.addEventListener("change", apply);
apply();
