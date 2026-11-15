// The app passcode: a 4-digit lock on this device, on top of staying logged in.
// Only a salted SHA-256 hash is kept, never the digits themselves.
const KEY = "dormming.passcode";
const UNLOCKED = "dormming.unlocked"; // this tab, until the app is closed

async function hash(code, salt) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${code}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

export const hasPasscode = () => Boolean(read());

export async function setPasscode(code) {
  if (!/^\d{4}$/.test(code)) throw new Error("Use 4 digits");
  const salt = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, "0")).join("");
  localStorage.setItem(KEY, JSON.stringify({ salt, hash: await hash(code, salt) }));
}

export async function checkPasscode(code) {
  const saved = read();
  return Boolean(saved) && (await hash(code, saved.salt)) === saved.hash;
}

export function clearPasscode() {
  localStorage.removeItem(KEY);
  try { localStorage.removeItem("dormming.pinTries"); } catch { /* nothing */ }
}

export const isUnlocked = () => { try { return sessionStorage.getItem(UNLOCKED) === "1"; } catch { return false; } };
export const markUnlocked = () => { try { sessionStorage.setItem(UNLOCKED, "1"); } catch { /* lasts this render */ } };

// After sign-up, Home offers a PIN once. Kept for this tab only, so it never nags later.
const OFFER = "dormming.offerPin";
export const offerPinSoon = () => { try { sessionStorage.setItem(OFFER, "1"); } catch { /* no offer */ } };
export const shouldOfferPin = () => { try { return pinApplies() && sessionStorage.getItem(OFFER) === "1" && !hasPasscode(); } catch { return false; } };
export const dropPinOffer = () => { try { sessionStorage.removeItem(OFFER); } catch { /* nothing to drop */ } };

/** The PIN is a phone feature (touch screens): on a laptop's browser there's no lock, setting or offer. */
export const pinApplies = () => typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;

// Wrong-PIN limit, so a 4-digit PIN can't simply be guessed: 4 free tries, then a wait that doubles
// (30 s, 1 min, 2 min…), and the 10th wrong PIN logs you out of this phone.
const TRIES = "dormming.pinTries";
const FREE = 4;
const LOG_OUT_AT = 10;

/** What happens after {@code wrong} wrong PINs in a row. */
export function pinLockout(wrong) {
  if (wrong >= LOG_OUT_AT) return { waitMs: 0, logOut: true };
  if (wrong <= FREE) return { waitMs: 0, logOut: false };
  return { waitMs: 30000 * 2 ** (wrong - FREE - 1), logOut: false };
}

const readTries = () => { try { return JSON.parse(localStorage.getItem(TRIES)) ?? { wrong: 0, until: 0 }; } catch { return { wrong: 0, until: 0 }; } };

/** Milliseconds left before another PIN may be tried (0 when free to try). Survives closing the app. */
export const pinWaitLeft = (now = Date.now()) => Math.max(0, readTries().until - now);

/** Counts a wrong PIN and returns what happens now: a wait, or logging out. */
export function recordWrongPin(now = Date.now()) {
  const wrong = readTries().wrong + 1;
  const result = pinLockout(wrong);
  try { localStorage.setItem(TRIES, JSON.stringify({ wrong, until: now + result.waitMs })); } catch { /* best effort */ }
  return result;
}

export const resetPinTries = () => { try { localStorage.removeItem(TRIES); } catch { /* nothing */ } };
