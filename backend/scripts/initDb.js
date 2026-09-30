const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

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
    console.error('❌ Database initialization error:', error.message);
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
