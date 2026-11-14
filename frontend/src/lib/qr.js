import jsQR from "jsqr";

// Dorm codes: 6 characters, no I, O, 0 or 1 (same alphabet as the backend's InviteCode).
const CODE = /^[A-HJ-NP-Z2-9]{6}$/;

/** The link a dorm's QR code holds; any phone camera opens it straight into the join flow. */
export const joinUrl = (code, origin = location.origin) => `${origin}/join/${code}`;

/** The dorm code inside what a QR held: a join link or a bare code. Null when it is neither. */
export function codeFromQr(text) {
  const last = String(text ?? "").trim().split("/").pop().toUpperCase();
  return CODE.test(last) ? last : null;
}

/** Reads a QR code from a photo (taken with the phone camera or picked from the gallery). */
export async function readQrFromPhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height)); // big photos decode slowly
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data, width, height)?.data ?? null;
}
