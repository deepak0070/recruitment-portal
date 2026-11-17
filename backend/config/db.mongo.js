const mongoose = require('mongoose');
const config = require('./index');

function maskUri(uri) {
  return (uri || '').replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

function isRemoteMongo(uri) {
  const lower = (uri || '').toLowerCase();
  return !lower.includes('127.0.0.1') && !lower.includes('localhost');
}

async function connectMongo() {
  const uri = config.mongo.uri;
  const safeUri = maskUri(uri);
  const remoteOrProd = isRemoteMongo(uri) || config.nodeEnv === 'production';
  const maxAttempts = remoteOrProd ? 5 : 1;
  const retryDelayMs = 2500;

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected successfully to: ${safeUri}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[MongoDB] Disconnected');
  });

  const hasAuth = uri.includes('@');
  const connectOptions = {
    serverSelectionTimeoutMS: remoteOrProd ? 8000 : 1500,
    dbName: process.env.MONGO_DB_NAME || 'recruitment_portal',
    ...(hasAuth && !uri.includes('authSource=') ? { authSource: 'admin' } : {})
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, connectOptions);
      return true;
    } catch (error) {
      if (attempt < maxAttempts) {
        console.log(`⏳ [MongoDB] Attempt ${attempt}/${maxAttempts} failed (${error.message}). Retrying in ${retryDelayMs}ms...`);
        await new Promise((r) => setTimeout(r, retryDelayMs));
      } else {
        console.log(`ℹ️ [MongoDB] No MongoDB server responding on ${safeUri} (${error.message}).`);
        console.log(`⚡ [LocalDB] Audit logs and notes stored in Zero-Install Local Mode.`);
        return false;
      }
    }
  }
  return false;
}

module.exports = {
  connectMongo,
  mongoose
};
