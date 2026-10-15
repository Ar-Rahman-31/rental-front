import crypto from 'crypto';
import { calculateBillableDays } from './date.js';

export const generateReference = () => 'BK' + crypto.randomBytes(4).toString('hex').toUpperCase();

export const computeAmount = (pickup, ret, pricePerDay) => {
  const days = calculateBillableDays(pickup, ret);
  return { days, total: days * pricePerDay };
};

export const pendingExpiry = () => new Date(Date.now() + 30 * 60 * 1000);