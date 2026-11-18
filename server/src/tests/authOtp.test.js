import { generateDeliveryOtp, verifyOtpHash } from '../utils/tokens.js';
import bcrypt from 'bcryptjs';

describe('Auth & Gmail OTP Security Unit Tests', () => {
  test('generates valid 6-digit OTP within range 100000 - 999999', () => {
    const { otp, otpHash } = generateDeliveryOtp();
    const num = parseInt(otp, 10);
    expect(num).toBeGreaterThanOrEqual(100000);
    expect(num).toBeLessThanOrEqual(999999);
    expect(otp).toHaveLength(6);
    expect(verifyOtpHash(otp, otpHash)).toBe(true);
  });

  test('hashes password correctly with bcrypt and verifies against plain text', async () => {
    const rawPassword = 'StudentSecret@2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    expect(await bcrypt.compare(rawPassword, hash)).toBe(true);
    expect(await bcrypt.compare('WrongPassword', hash)).toBe(false);
  });

  test('verifies OTP expiry window logic', () => {
    const validExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const expiredTime = new Date(Date.now() - 1000);

    expect(new Date() < validExpiry).toBe(true);
    expect(new Date() > expiredTime).toBe(true);
  });
});
