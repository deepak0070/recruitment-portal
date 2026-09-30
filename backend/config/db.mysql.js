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

const localDb = require('./localDb');

/**
 * Test MySQL connection or seamlessly fall back to Zero-Install Local Mode
 */
async function testConnection() {
  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log(`ℹ️ [MySQL] No MySQL server responding on ${config.mysql.host}:${config.mysql.port}.`);
        console.log(`⚡ [LocalDB] Switched to Zero-Install Local Mode (persisted in backend/data/db.json).`);
        setQueryHandler((sql, params) => localDb.execute(sql, params));
        resolve(true);
      }
    }, 1500);

    try {
      const p = getPool();
      p.getConnection()
        .then((connection) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.log(`[MySQL] Connected successfully to database: ${config.mysql.database}`);
            connection.release();
            resolve(true);
          }
        })
        .catch((error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.log(`ℹ️ [MySQL] No MySQL server running on ${config.mysql.host}:${config.mysql.port}.`);
            console.log(`⚡ [LocalDB] Switched to Zero-Install Local Mode (persisted in backend/data/db.json).`);
            setQueryHandler((sql, params) => localDb.execute(sql, params));
            resolve(true);
          }
        });
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        setQueryHandler((sql, params) => localDb.execute(sql, params));
        resolve(true);
      }
    }
  });
}

module.exports = {
  getPool,
  query,
  setQueryHandler,
  testConnection
};
