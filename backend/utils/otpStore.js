// Simple in-memory OTP store (transient, not persisted)
const otpStore = {}; // { key: { otp, expiresAt } }

function setOTP(key, otp, ttlSeconds = 300) {
  otpStore[key] = {
    otp,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  setTimeout(() => {
    if (otpStore[key] && otpStore[key].expiresAt <= Date.now()) {
      delete otpStore[key];
    }
  }, ttlSeconds * 1000 + 1000); // buffer 1s
}

function getOTP(key) {
  const entry = otpStore[key];
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    delete otpStore[key];
    return null;
  }
  return entry.otp;
}

function clearOTP(key) {
  delete otpStore[key];
}

export { setOTP, getOTP, clearOTP }; 