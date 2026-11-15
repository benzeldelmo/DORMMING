const KEY = "dormming.reduceMotion";

/** The "Reduce motion" setting, remembered on this device (the phone's own setting is always respected too). */
export const getReduceMotion = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

export function setReduceMotion(on) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* private mode: lasts this visit */ }
  document.documentElement.classList.toggle("reduce-motion", on);
}

document.documentElement.classList.toggle("reduce-motion", getReduceMotion());
