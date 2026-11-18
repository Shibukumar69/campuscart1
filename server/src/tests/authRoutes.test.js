import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';

describe('Auth & Gmail OTP End-to-End API Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuscart_ai');
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  const testEmail = 'student@campuscart.edu';
  let capturedOtp = null;

  test('POST /api/auth/forgot-password sends OTP and returns devOtp in dev mode', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.devOtp).toBeDefined();
    expect(res.body.data.devOtp).toHaveLength(6);
    capturedOtp = res.body.data.devOtp;
  });

  test('POST /api/auth/verify-reset-otp validates the correct 6-digit OTP', async () => {
    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: testEmail, otp: capturedOtp });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/verify-reset-otp rejects invalid OTP', async () => {
    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: testEmail, otp: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/reset-password resets password to new one', async () => {
    const newPass = 'UpdatedCampusPass@2026';
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: testEmail, otp: capturedOtp, newPassword: newPass });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify login with new password succeeds
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: newPass });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();

    // Reset password back to default 'Campus@123' so demo logins work seamlessly
    const resetBack = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });
    await request(app)
      .post('/api/auth/reset-password')
      .send({ email: testEmail, otp: resetBack.body.data.devOtp, newPassword: 'Campus@123' });
  });

  test('POST /api/auth/send-login-otp and /api/auth/login-otp for passwordless sign-in', async () => {
    const sendRes = await request(app)
      .post('/api/auth/send-login-otp')
      .send({ email: testEmail });

    expect(sendRes.status).toBe(200);
    const loginOtp = sendRes.body.data?.devOtp;
    expect(loginOtp).toHaveLength(6);

    const loginRes = await request(app)
      .post('/api/auth/login-otp')
      .send({ email: testEmail, otp: loginOtp });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.body.data.user.email).toBe(testEmail);
  });

  test('POST /api/auth/send-signup-otp and /api/auth/register with verified OTP', async () => {
    const signupEmail = `newstudent_${Date.now()}@campuscart.edu`;

    const sendRes = await request(app)
      .post('/api/auth/send-signup-otp')
      .send({ email: signupEmail, name: 'Fresh Student' });

    expect(sendRes.status).toBe(200);
    expect(sendRes.body.success).toBe(true);
    const signupOtp = sendRes.body.data?.devOtp;
    expect(signupOtp).toHaveLength(6);

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Fresh Student',
        email: signupEmail,
        password: 'Password@123',
        otp: signupOtp,
        hostelBlock: 'Hostel Block B',
        roomNumber: '202',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.email).toBe(signupEmail);
    expect(regRes.body.data.accessToken).toBeDefined();

    // Clean up created test user
    await User.deleteOne({ email: signupEmail });
  });
});

