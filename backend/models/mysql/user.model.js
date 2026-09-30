const { query } = require('../../config/db.mysql');

class UserModel {
  /**
   * Find user by email
   * @param {string} email
   */
  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
    return rows[0] || null;
  }

  /**
   * Find user by ID (excluding password hash)
   * @param {number} id
   */
  static async findById(id) {
    const rows = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user
   * @param {Object} userData
   */
  static async create({ name, email, passwordHash, role = 'candidate' }) {
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, role]
    );
    return {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role
    };
  }
}

module.exports = UserModel;
