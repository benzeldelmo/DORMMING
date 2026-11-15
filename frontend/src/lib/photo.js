const SIZE = 256;

/**
 * Turns a picked image into a small square profile photo: the middle of the picture, 256px, as a JPEG
 * data URL (about 20-40 KB), so it can be saved with the account and shown everywhere.
 */
export async function squarePhoto(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("Pick a photo");
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  canvas.getContext("2d").drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
