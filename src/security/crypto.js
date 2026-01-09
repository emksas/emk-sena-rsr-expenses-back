import crypto from "crypto";
console.log("KEY RAW:", process.env.MSAL_CACHE_ENC_KEY);

// 32 bytes en hex = 64 chars
const keyHex = process.env.MSAL_CACHE_ENC_KEY;
if (!keyHex || keyHex.length !== 64) {
  throw new Error("MSAL_CACHE_ENC_KEY debe ser 32 bytes en hex (64 chars).");
}
const KEY = Buffer.from(keyHex, "hex");

export function encrypt(plaintext) {
  const iv = crypto.randomBytes(12); // recomendado para AES-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // payload = iv + tag + ciphertext
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decrypt(payloadB64) {
  const buf = Buffer.from(payloadB64, "base64");

  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28); // 16 bytes
  const ciphertext = buf.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}