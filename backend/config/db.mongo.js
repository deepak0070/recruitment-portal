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
      serverSelectionTimeoutMS: 5000
    });
    return true;
  } catch (error) {
    console.error(`[MongoDB] Connection warning: ${error.message}`);
    return false;
  }
}

module.exports = {
  connectMongo,
  mongoose
};
