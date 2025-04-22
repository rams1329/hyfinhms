import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.PHONE_ENCRYPTION_KEY, "hex"); // 32 bytes
const iv = Buffer.from(process.env.PHONE_ENCRYPTION_IV, "hex");   // 16 bytes

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
} 