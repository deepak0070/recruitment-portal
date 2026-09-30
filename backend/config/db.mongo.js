const mongoose = require('mongoose');
const config = require('./index');

async function connectMongo() {
  try {
    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected successfully to: ${config.mongo.uri}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Disconnected');
    });

    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 1500
    });
    return true;
  } catch (error) {
    console.log(`ℹ️ [MongoDB] No MongoDB server running on ${config.mongo.uri}.`);
    console.log(`⚡ [LocalDB] Audit logs and notes stored in Zero-Install Local Mode.`);
    return false;
  }
}

module.exports = {
  connectMongo,
  mongoose
};
