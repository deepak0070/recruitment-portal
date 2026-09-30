const { query } = require('../../config/db.mysql');

class ApplicationModel {
  /**
   * Find application by job ID and user ID (duplicate check)
   */
  static async findByJobAndUser(jobId, userId) {
    const sql = `
      SELECT * FROM applications 
      WHERE job_id = ? AND user_id = ? 
      LIMIT 1
    `;
    const rows = await query(sql, [jobId, userId]);
    return rows[0] || null;
  }

  /**
   * Find application by ID with user and job details
   */
  static async findById(id) {
    const sql = `
      SELECT 
        a.id,
        a.job_id,
        a.user_id,
        a.resume_path,
        a.cover_note,
        a.status,
        a.applied_at,
        a.updated_at,
        u.name AS candidate_name,
        u.email AS candidate_email,
        j.title AS job_title,
        j.location AS job_location,
        j.job_type AS job_type,
        j.salary_range AS job_salary_range,
        j.status AS job_status
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new job application
   */
  static async create({ job_id, user_id, resume_path, cover_note }) {
    const sql = `
      INSERT INTO applications (job_id, user_id, resume_path, cover_note, status)
      VALUES (?, ?, ?, ?, 'applied')
    `;
    const result = await query(sql, [
      job_id,
      user_id,
      resume_path,
      cover_note ? cover_note.trim() : null
    ]);

    return this.findById(result.insertId);
  }

  /**
   * Find all applications submitted by a specific candidate
   */
  static async findByCandidate(userId) {
    const sql = `
      SELECT 
        a.id,
        a.job_id,
        a.status,
        a.cover_note,
        a.applied_at,
        a.updated_at,
        j.title AS job_title,
        j.location AS job_location,
        j.job_type AS job_type,
        j.salary_range AS job_salary_range,
        j.status AS job_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `;
    return await query(sql, [userId]);
  }

  /**
   * Find applications for a specific job (Admin review) with optional status filter
   */
  static async findByJob(jobId, statusFilter = null) {
    const conditions = ['a.job_id = ?'];
    const params = [jobId];

    if (statusFilter && statusFilter !== 'all') {
      conditions.push('a.status = ?');
      params.push(statusFilter);
    }

    const sql = `
      SELECT 
        a.id,
        a.job_id,
        a.user_id,
        a.resume_path,
        a.cover_note,
        a.status,
        a.applied_at,
        a.updated_at,
        u.name AS candidate_name,
        u.email AS candidate_email
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.applied_at DESC
    `;
    return await query(sql, params);
  }

  /**
   * Update application status through pipeline
   */
  static async updateStatus(id, newStatus) {
    const sql = 'UPDATE applications SET status = ? WHERE id = ?';
    await query(sql, [newStatus, id]);
    return this.findById(id);
  }

  /**
   * Count applications grouped by status
   */
  static async countByStatus() {
    const sql = `
      SELECT status, COUNT(*) AS count
      FROM applications
      GROUP BY status
    `;
    const rows = await query(sql);
    const result = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      rejected: 0
    };
    rows.forEach(r => {
      if (result[r.status] !== undefined) {
        result[r.status] = parseInt(r.count, 10);
      }
    });
    return result;
  }

  /**
   * Count total applications
   */
  static async countTotal() {
    const sql = 'SELECT COUNT(*) AS total FROM applications';
    const rows = await query(sql);
    return rows[0].total || 0;
  }
}

module.exports = ApplicationModel;
