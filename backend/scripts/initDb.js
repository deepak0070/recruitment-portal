const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

async function initDb() {
  console.log('--- Initializing Database ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      multipleStatements: true,
      connectTimeout: 2000
    });

    console.log(`Connected to external MySQL server at ${config.mysql.host}:${config.mysql.port}`);

    const sqlPath = path.resolve(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(sql);

    console.log('✅ Database schema created/verified successfully!');
  } catch (error) {
    console.log(`ℹ️ No external MySQL server found on ${config.mysql.host}:${config.mysql.port}.`);
    console.log('⚡ Initializing Zero-Install Local Mode (persisted database)...');
    const localDb = require('../config/localDb');
    localDb.initDefaultData();
    console.log('✅ Zero-Install database initialized successfully in backend/data/db.json!');
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
