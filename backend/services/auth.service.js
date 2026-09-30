const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const UserModel = require('../models/mysql/user.model');
const { AppError } = require('../middleware/error.middleware');

class AuthService {
  /**
   * Generate JWT token for user
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Register a new user
   */
  static async register({ name, email, password, role = 'candidate' }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Authenticate existing user
   */
  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Get user profile by ID
   */
  static async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 404);
    }
    return user;
  }
}

module.exports = AuthService;
