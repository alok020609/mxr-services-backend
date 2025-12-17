const request = require('supertest');
const app = require('../../../src/server');
const { createUser, createAdmin } = require('../../helpers/factories');
const { generateTestToken } = require('../../helpers/testHelpers');

describe('Auth API - Integration Tests', () => {
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    testUser = await createUser();
    testAdmin = await createAdmin();
  });

  afterAll(async () => {
    // Cleanup handled by global teardown
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: `newuser-${Date.now()}@example.com`,
        password: 'password123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: testUser.email,
        password: 'password123',
        name: 'Duplicate User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: `user-${Date.now()}@example.com`,
        password: '123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong_password',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const token = generateTestToken(testUser.id);

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});


