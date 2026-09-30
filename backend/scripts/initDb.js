const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

function formatError(error) {
  if (error.code === 'ECONNREFUSED' || (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED'))) {
    return `Could not connect to MySQL at ${config.mysql.host}:${config.mysql.port} (Connection Refused).\n👉 Please verify that your MySQL server is running (e.g. via XAMPP, MySQL Windows Service, or Docker), or check DB_HOST / DB_PORT in backend/.env.`;
  }
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return `Access denied for user '${config.mysql.user}'@'${config.mysql.host}'.\n👉 Please verify DB_USER and DB_PASSWORD in your backend/.env file.`;
  }
  return error.message || error.code || String(error);
}

async function initDb() {
  console.log('--- Initializing MySQL Database ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      multipleStatements: true
    });

    console.log(`Connected to MySQL server at ${config.mysql.host}:${config.mysql.port}`);

    const sqlPath = path.resolve(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(sql);

    console.log('✅ Database schema created/verified successfully!');
  } catch (error) {
    console.error('\n❌ Database initialization error:\n' + formatError(error) + '\n');
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
