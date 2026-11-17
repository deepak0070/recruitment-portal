const { query } = require('../../config/db.mysql');

class JobModel {
  /**
   * Find jobs with filtering, searching, and pagination
   */
  static async findAll({
    search = '',
    location = '',
    jobType = '',
    experience = '',
    status = 'open',
    page = 1,
    limit = 10
  }) {
    const conditions = [];
    const params = [];

    // Filter by status if provided (public only sees 'open', admin can specify 'all' or 'closed')
    if (status && status !== 'all') {
      conditions.push('j.status = ?');
      params.push(status);
    }

    // Filter by keyword / search (title or description)
    if (search && search.trim() !== '') {
      conditions.push('(j.title LIKE ? OR j.description LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Filter by location
    if (location && location.trim() !== '') {
      conditions.push('j.location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    // Filter by job type
    if (jobType && jobType.trim() !== '') {
      conditions.push('j.job_type = ?');
      params.push(jobType.trim());
    }

    // Filter by experience level
    if (experience && experience.trim() !== '') {
      conditions.push('j.experience_level = ?');
      params.push(experience.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching records
    const countSql = `SELECT COUNT(*) as total FROM jobs j ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    // Fetch paginated jobs with creator details and application counts
    const dataSql = `
      SELECT 
        j.id, 
        j.title, 
        j.description, 
        j.location, 
        j.job_type, 
        j.experience_level,
        j.salary_range, 
        j.status, 
        j.created_by, 
        j.created_at, 
        j.updated_at,
        u.name AS creator_name,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
      FROM jobs j
      LEFT JOIN users u ON j.created_by = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const jobs = await query(dataSql, [...params, limitNum, offset]);

    return {
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Find a single job by ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        j.id, 
        j.title, 
        j.description, 
        j.location, 
        j.job_type, 
        j.experience_level,
        j.salary_range, 
        j.status, 
        j.created_by, 
        j.created_at, 
        j.updated_at,
        u.name AS creator_name,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
      FROM jobs j
      LEFT JOIN users u ON j.created_by = u.id
      WHERE j.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new job posting
   */
  static async create({
    title,
    description,
    location,
    job_type,
    experience_level = 'Mid-Level',
    salary_range = null,
    status = 'open',
    created_by
  }) {
    const sql = `
      INSERT INTO jobs (title, description, location, job_type, experience_level, salary_range, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      title.trim(),
      description.trim(),
      location.trim(),
      job_type.trim(),
      (experience_level || 'Mid-Level').trim(),
      salary_range ? salary_range.trim() : null,
      status,
      created_by
    ]);

    return this.findById(result.insertId);
  }

  /**
   * Update an existing job posting
   */
  static async update(id, fields) {
    const allowedFields = ['title', 'description', 'location', 'job_type', 'experience_level', 'salary_range', 'status'];
    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const sql = `UPDATE jobs SET ${setClauses.join(', ')} WHERE id = ?`;
    await query(sql, params);

    return this.findById(id);
  }

  /**
   * Delete a job posting
   */
  static async delete(id) {
    const sql = 'DELETE FROM jobs WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = JobModel;
