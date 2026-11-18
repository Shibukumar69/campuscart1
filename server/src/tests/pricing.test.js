import { calculatePrintPrice, DEFAULT_PRINT_RATES } from '../utils/pricingEngine.js';
import { generateDeliveryOtp, verifyOtpHash } from '../utils/tokens.js';

describe('CampusCart AI Utility & Business Logic Tests', () => {
  describe('Print Pricing Engine', () => {
    test('calculates single-sided black & white printing correctly', () => {
      const result = calculatePrintPrice({
        pageCount: 10,
        copies: 1,
        printColor: 'BW',
        sides: 'SINGLE',
        bindingType: 'NONE',
      });

      // 10 pages * 1.5 INR = 15.00 INR + 5.00 base = 20.00
      expect(result.pageCostPerCopy).toBe(15.0);
      expect(result.bindingCharge).toBe(0);
      expect(result.totalPrice).toBe(20.0);
    });

    test('calculates double-sided color printing with spiral binding', () => {
      const result = calculatePrintPrice({
        pageCount: 10, // 5 sheets
        copies: 2,
        printColor: 'COLOR',
        sides: 'DOUBLE',
        bindingType: 'SPIRAL',
      });

      // 5 sheets * 10 INR = 50 INR per copy + 35 binding = 85 per copy * 2 = 170 + 5 base = 175
      expect(result.pageCostPerCopy).toBe(50.0);
      expect(result.bindingCharge).toBe(35);
      expect(result.totalPrice).toBe(175.0);
    });
  });

  describe('Delivery OTP Verification', () => {
    test('generates 6-digit OTP and matching SHA-256 hash', () => {
      const { otp, otpHash } = generateDeliveryOtp();
      expect(otp).toHaveLength(6);
      expect(typeof otpHash).toBe('string');
      expect(otpHash.length).toBe(64); // SHA-256 hex length
      expect(verifyOtpHash(otp, otpHash)).toBe(true);
    });

    test('rejects incorrect OTPs', () => {
      const { otp, otpHash } = generateDeliveryOtp();
      const wrongOtp = otp === '123456' ? '654321' : '123456';
      expect(verifyOtpHash(wrongOtp, otpHash)).toBe(false);
    });
  });
});
