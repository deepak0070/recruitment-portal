const bcrypt = require('bcryptjs');
const { getPool, isUsingLocalDb } = require('./db.mysql');

const CREATE_USERS_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'candidate') NOT NULL DEFAULT 'candidate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;
`;

const CREATE_JOBS_SQL = `
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL DEFAULT 'Mid-Level',
    salary_range VARCHAR(100) NULL,
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_created_by (created_by),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_job_type (job_type),
    INDEX idx_jobs_experience (experience_level)
) ENGINE=InnoDB;
`;

const CREATE_APPLICATIONS_SQL = `
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    resume_path VARCHAR(255) NOT NULL,
    cover_note TEXT NULL,
    status ENUM('applied', 'shortlisted', 'interview', 'offered', 'rejected') NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_user (job_id, user_id),
    INDEX idx_applications_job_id (job_id),
    INDEX idx_applications_user_id (user_id),
    INDEX idx_applications_status (status)
) ENGINE=InnoDB;
`;

/**
 * Ensures required MySQL tables exist and seeds initial accounts/jobs on first boot.
 */
async function ensureSchemaAndSeed() {
  if (isUsingLocalDb()) {
    return;
  }

  try {
    const pool = getPool();
    await pool.query(CREATE_USERS_SQL);
    await pool.query(CREATE_JOBS_SQL);
    await pool.query(CREATE_APPLICATIONS_SQL);

    // Safe migration: add experience_level column to existing jobs tables if missing
    const [expCols] = await pool.query("SHOW COLUMNS FROM jobs LIKE 'experience_level'");
    if (expCols.length === 0) {
      console.log('🔧 [MySQL] Migrating jobs table: adding experience_level column...');
      await pool.query(
        "ALTER TABLE jobs ADD COLUMN experience_level VARCHAR(50) NOT NULL DEFAULT 'Mid-Level' AFTER job_type, ADD INDEX idx_jobs_experience (experience_level)"
      );
      await pool.query("UPDATE jobs SET experience_level = 'Senior' WHERE LOWER(title) LIKE '%senior%' OR LOWER(title) LIKE '%devops%'");
      await pool.query("UPDATE jobs SET experience_level = 'Lead' WHERE LOWER(title) LIKE '%lead%' OR LOWER(title) LIKE '%staff%' OR LOWER(title) LIKE '%architect%'");
      await pool.query("UPDATE jobs SET experience_level = 'Junior' WHERE LOWER(title) LIKE '%frontend%' OR LOWER(title) LIKE '%junior%' OR LOWER(title) LIKE '%associate%'");
      await pool.query("UPDATE jobs SET experience_level = 'Fresher' WHERE LOWER(title) LIKE '%intern%' OR LOWER(title) LIKE '%fresher%' OR LOWER(title) LIKE '%designer%'");
      console.log('✅ [MySQL] experience_level migration complete.');
    }

    console.log('✅ [MySQL] Schema verified (users, jobs, applications).');

    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (rows[0] && Number(rows[0].count) === 0) {
      console.log('🌱 [MySQL] Empty database detected — seeding initial users and jobs...');
      const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

      const users = [
        ['Admin Recruiter', 'admin@recruitment.com', defaultPasswordHash, 'admin'],
        ['John Doe', 'john.doe@example.com', defaultPasswordHash, 'candidate'],
        ['Jane Smith', 'jane.smith@example.com', defaultPasswordHash, 'candidate'],
        ['Alex Kumar', 'alex.kumar@example.com', defaultPasswordHash, 'candidate']
      ];
      await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ?', [users]);

      const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      const adminId = adminRows[0].id;

      const jobs = [
        [
          'Senior Full-Stack Engineer',
          'We are seeking an experienced Senior Full-Stack Engineer to architect and build scalable web applications. You will work across Node.js, Express, React, MySQL, and modern cloud infrastructure.',
          'Remote',
          'Full-time',
          'Senior',
          '$120,000 - $150,000',
          'open',
          adminId
        ],
        [
          'Frontend Developer (React / Tailwind)',
          'Join our UI team to build sleek, accessible, and responsive user experiences using React, Vite, and Tailwind CSS. Experience with state management and REST APIs is required.',
          'New York, NY',
          'Full-time',
          'Junior',
          '$90,000 - $115,000',
          'open',
          adminId
        ],
        [
          'Backend Engineer (Node.js & MySQL)',
          'Focus on RESTful API design, database query optimization, security, and transaction management in high-throughput production environments.',
          'San Francisco, CA',
          'Contract',
          'Mid-Level',
          '$70 - $90 / hour',
          'open',
          adminId
        ],
        [
          'DevOps & Cloud Engineer',
          'Automate container deployment, monitor infrastructure performance, and ensure reliability and high availability across cloud platforms.',
          'Remote',
          'Full-time',
          'Senior',
          '$130,000 - $160,000',
          'open',
          adminId
        ],
        [
          'Product Designer (UI/UX)',
          'Create intuitive user flows, high-fidelity prototypes, and cohesive design systems for internal enterprise tooling and consumer web applications.',
          'Austin, TX',
          'Part-time',
          'Fresher',
          '$50,000 - $65,000',
          'closed',
          adminId
        ]
      ];
      await pool.query(
        'INSERT INTO jobs (title, description, location, job_type, experience_level, salary_range, status, created_by) VALUES ?',
        [jobs]
      );
      console.log('✅ [MySQL] Initial seed complete (admin@recruitment.com / Password@123).');
    } else {
      console.log(`✅ [MySQL] Existing data found (${rows[0].count} users); skipping initial seed.`);
    }
  } catch (error) {
    console.error('⚠️ [MySQL] Schema bootstrap warning:', error.message);
  }
}

module.exports = {
  ensureSchemaAndSeed
};
