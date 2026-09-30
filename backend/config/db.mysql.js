const mysql = require('mysql2/promise');
const config = require('./index');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: config.mysql.waitForConnections,
      connectionLimit: config.mysql.connectionLimit,
      queueLimit: config.mysql.queueLimit
    });
  }
  return pool;
}

let customQueryHandler = null;

function setQueryHandler(handler) {
  customQueryHandler = handler;
}

/**
 * Execute parameterized SQL query
 * @param {string} sql - SQL query string with ? placeholders
 * @param {Array} params - Array of parameters
 */
async function query(sql, params = []) {
  if (customQueryHandler) {
    return customQueryHandler(sql, params);
  }
  const p = getPool();
  const [results] = await p.execute(sql, params);
  return results;
}

/**
 * Test MySQL connection
 */
async function testConnection() {
  try {
    const p = getPool();
    const connection = await p.getConnection();
    console.log(`[MySQL] Connected successfully to database: ${config.mysql.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[MySQL] Connection warning: ${error.message}`);
    return false;
  }
}

module.exports = {
  getPool,
  query,
  setQueryHandler,
  testConnection
};
