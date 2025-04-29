// import crypto from "crypto";

// const algorithm = "aes-256-cbc";
// const key = Buffer.from(process.env.PHONE_ENCRYPTION_KEY, "hex"); // 32 bytes
// const iv = Buffer.from(process.env.PHONE_ENCRYPTION_IV, "hex");   // 16 bytes

// export function encrypt(text) {
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return encrypted;
// }

// export function decrypt(encrypted) {
//   const decipher = crypto.createDecipheriv(algorithm, key, iv);
//   let decrypted = decipher.update(encrypted, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// } 

// In utils/crypto.js
import crypto from 'crypto';

// Define the encryption method and keys
const method = 'aes-256-cbc'; // Define the method that was missing
const key = crypto.scryptSync('your-secret-key', 'salt', 32); // 32 bytes for aes-256
const encryptionIV = crypto.randomBytes(16); // 16 bytes for AES

export const encrypt = (data) => {
  try {
    const cipher = crypto.createCipheriv(method, key, encryptionIV);
    return Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]).toString('base64');
  } catch (error) {
    console.error("Encryption error:", error);
    return undefined;
  }
};

export const decrypt = (encryptedData) => {
  try {
    const buff = Buffer.from(encryptedData, 'base64');
    const decipher = crypto.createDecipheriv(method, key, encryptionIV);
    
    return (
      decipher.update(buff) + 
      decipher.final('utf8')
    );
  } catch (error) {
    console.error("Decryption error:", error);
    return undefined;
  }
};
