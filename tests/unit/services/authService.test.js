const authService = require('../../../src/services/authService');
const prisma = require('../../../src/config/database');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('bcryptjs');

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const mockHash = 'hashed_password_123';
      bcrypt.hash.mockResolvedValue(mockHash);

      const result = await authService.hashPassword('password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toBe(mockHash);
    });

    it('should throw error if hashing fails', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(authService.hashPassword('password123')).rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.comparePassword('password123', 'hashed_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.comparePassword('wrong_password', 'hashed_password');

      expect(result).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = {
        id: 'user-123',
        ...userData,
        password: 'hashed_password',
        role: 'CUSTOMER',
        createdAt: new Date(),
      };

      bcrypt.hash.mockResolvedValue('hashed_password');
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await authService.registerUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: 'hashed_password',
          name: userData.name,
          role: 'CUSTOMER',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });
      bcrypt.hash.mockResolvedValue('hashed_password');
      prisma.user.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed',
      });

      await expect(authService.registerUser(userData)).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    it('should login user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        id: 'user-123',
        email,
        password: 'hashed_password',
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.loginUser(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should throw error for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.loginUser('invalid@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed_password',
        isActive: true,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.loginUser('test@example.com', 'wrong_password')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});


