import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import { env } from '../config/env.js';

const KEY = CryptoJS.enc.Utf8.parse(env.ENCRYPTION_KEY);

export const encrypt = (text) => {
  if (!text) return null;
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(String(text), KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return `${iv.toString()}:${encrypted.ciphertext.toString()}`;
};

export const decrypt = (cipherText) => {
  if (!cipherText) return null;
  try {
    const [ivHex, encryptedHex] = cipherText.split(':');
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      KEY,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return null;
  const last4 = aadhaar.slice(-4);
  return `XXXX-XXXX-${last4}`;
};

export const maskAccount = (acc) => {
  if (!acc) return null;
  return `XXXX${acc.slice(-4)}`;
};

export const generatePassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
  let pwd = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
};

export const isWithinTimeWindow = (startTime, endTime) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const currentMinutes = Number(values.hour) * 60 + Number(values.minute);
  const toMinutes = (time) => {
    const [hours, minutes] = typeof time === 'number' ? [time, 0] : time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  return currentMinutes >= toMinutes(startTime) && currentMinutes < toMinutes(endTime);
};

// ✅ FIX #22: Intl.DateTimeFormat (timezone safe, no locale parsing)
export const getISTDateString = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};