const mysql = require('mysql2/promise');
const config = require('./index');

let pool = null;
let usingLocalDb = false;

function isRemoteHost() {
  const host = (config.mysql.host || '').toLowerCase();
  return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
}

function isUsingLocalDb() {
  return usingLocalDb;
}

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
      queueLimit: config.mysql.queueLimit,
      connectTimeout: isRemoteHost() ? 10000 : 2000
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

function trySingleConnection(timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Connection timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    try {
      const p = getPool();
      p.getConnection()
        .then((connection) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            connection.release();
            resolve(true);
          } else {
            connection.release();
          }
        })
        .catch((error) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(error);
          }
        });
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(e);
      }
    }
  });
}

/**
 * Test MySQL connection (with retries for cloud/production hosts)
 * or seamlessly fall back to Zero-Install Local Mode
 */
async function testConnection() {
  if (customQueryHandler) {
    return true;
  }

  const remoteOrProd = isRemoteHost() || config.nodeEnv === 'production';
  const maxAttempts = remoteOrProd ? 6 : 1;
  const timeoutMs = remoteOrProd ? 8000 : 1500;
  const retryDelayMs = 2500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await trySingleConnection(timeoutMs);
      usingLocalDb = false;
      console.log(`[MySQL] Connected successfully to ${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`);
      return true;
    } catch (error) {
      if (attempt < maxAttempts) {
        console.log(`⏳ [MySQL] Attempt ${attempt}/${maxAttempts} failed (${error.message}). Retrying in ${retryDelayMs}ms...`);
        await new Promise((r) => setTimeout(r, retryDelayMs));
      } else {
        console.log(`ℹ️ [MySQL] No MySQL server responding on ${config.mysql.host}:${config.mysql.port} (${error.message}).`);
        console.log(`⚡ [LocalDB] Switched to Zero-Install Local Mode (persisted in backend/data/db.json).`);
        usingLocalDb = true;
        setQueryHandler((sql, params) => localDb.execute(sql, params));
        return true;
      }
    }
  }
  return true;
}

async function checkHealth() {
  if (usingLocalDb) {
    return 'local-json';
  }
  if (customQueryHandler) {
    return 'connected';
  }
  try {
    const p = getPool();
    await p.query('SELECT 1');
    return 'connected';
  } catch (e) {
    return 'disconnected';
  }
}

module.exports = {
  getPool,
  query,
  setQueryHandler,
  testConnection,
  isUsingLocalDb,
  checkHealth
};
