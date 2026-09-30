const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const config = require('../config');

function formatError(error) {
  if (error.code === 'ECONNREFUSED' || (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED'))) {
    return `Could not connect to MySQL at ${config.mysql.host}:${config.mysql.port} (Connection Refused).\n👉 Please verify that your MySQL server is running (e.g. via XAMPP, MySQL Service, or Docker), or check DB_HOST / DB_PORT in backend/.env.`;
  }
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return `Access denied for user '${config.mysql.user}'@'${config.mysql.host}'.\n👉 Please verify DB_USER and DB_PASSWORD in your backend/.env file.`;
  }
  return error.message || error.code || String(error);
}

async function seed() {
  console.log('--- Seeding Database with Initial Data ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database
    });

    console.log('Connected to MySQL. Clearing existing records (preserving schema)...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE applications;');
    await connection.query('TRUNCATE TABLE jobs;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('Hashing passwords with bcrypt...');
    const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

    // 1. Seed Users
    const users = [
      ['Admin Recruiter', 'admin@recruitment.com', defaultPasswordHash, 'admin'],
      ['John Doe', 'john.doe@example.com', defaultPasswordHash, 'candidate'],
      ['Jane Smith', 'jane.smith@example.com', defaultPasswordHash, 'candidate'],
      ['Alex Kumar', 'alex.kumar@example.com', defaultPasswordHash, 'candidate']
    ];

    console.log('Inserting users...');
    const userInsertQuery = 'INSERT INTO users (name, email, password_hash, role) VALUES ?';
    await connection.query(userInsertQuery, [users]);

    // Retrieve Admin ID
    const [adminRows] = await connection.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    const adminId = adminRows[0].id;

    // 2. Seed Jobs
    const jobs = [
      [
        'Senior Full-Stack Engineer',
        'We are seeking an experienced Senior Full-Stack Engineer to architect and build scalable web applications. You will work across Node.js, Express, React, MySQL, and modern cloud infrastructure.',
        'Remote',
        'Full-time',
        '$120,000 - $150,000',
        'open',
        adminId
      ],
      [
        'Frontend Developer (React / Tailwind)',
        'Join our UI team to build sleek, accessible, and responsive user experiences using React, Vite, and Tailwind CSS. Experience with state management and REST APIs is required.',
        'New York, NY',
        'Full-time',
        '$90,000 - $115,000',
        'open',
        adminId
      ],
      [
        'Backend Engineer (Node.js & MySQL)',
        'Focus on RESTful API design, database query optimization, security, and transaction management in high-throughput production environments.',
        'San Francisco, CA',
        'Contract',
        '$70 - $90 / hour',
        'open',
        adminId
      ],
      [
        'DevOps & Cloud Engineer',
        'Automate container deployment, monitor infrastructure performance, and ensure reliability and high availability across cloud platforms.',
        'Remote',
        'Full-time',
        '$130,000 - $160,000',
        'open',
        adminId
      ],
      [
        'Product Designer (UI/UX)',
        'Create intuitive user flows, high-fidelity prototypes, and cohesive design systems for internal enterprise tooling and consumer web applications.',
        'Austin, TX',
        'Part-time',
        '$50,000 - $65,000',
        'closed',
        adminId
      ]
    ];

    console.log('Inserting jobs...');
    const jobInsertQuery = `
      INSERT INTO jobs (title, description, location, job_type, salary_range, status, created_by)
      VALUES ?
    `;
    await connection.query(jobInsertQuery, [jobs]);

    console.log('✅ MySQL seeding complete!');
    console.log('----------------------------------------------------');
    console.log('Default Admin Account:');
    console.log('  Email:    admin@recruitment.com');
    console.log('  Password: Password@123');
    console.log('Default Candidate Accounts:');
    console.log('  Email:    john.doe@example.com / jane.smith@example.com');
    console.log('  Password: Password@123');
    console.log('----------------------------------------------------');

    // Optional MongoDB seed
    try {
      await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 2000 });
      const ActivityLog = mongoose.model(
        'ActivityLog',
        new mongoose.Schema({
          action: String,
          performedBy: Object,
          targetType: String,
          targetId: String,
          metadata: Object,
          createdAt: { type: Date, default: Date.now }
        }),
        'activity_logs'
      );

      await ActivityLog.create({
        action: 'SYSTEM_INITIALIZED',
        performedBy: { id: adminId, name: 'Admin Recruiter', role: 'admin' },
        targetType: 'system',
        targetId: 'seed',
        metadata: { message: 'Database seeded with default jobs and accounts' }
      });
      console.log('✅ MongoDB activity log seeded!');
      await mongoose.disconnect();
    } catch (mErr) {
      console.log(`ℹ️ MongoDB seeding skipped (${mErr.message}) - will seed when Mongo is running.`);
  } catch (error) {
    console.error('\n❌ Seeding error:\n' + formatError(error) + '\n');
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
