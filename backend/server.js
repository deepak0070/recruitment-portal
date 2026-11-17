const app = require('./app');
const config = require('./config');
const { testConnection } = require('./config/db.mysql');
const { ensureSchemaAndSeed } = require('./config/bootstrapDb');
const { connectMongo } = require('./config/db.mongo');

async function startServer() {
  console.log('--- Starting Recruitment Portal Server ---');

  // Test MySQL connection and auto-bootstrap tables + seed if empty
  await testConnection();
  await ensureSchemaAndSeed();

  // Connect MongoDB
  await connectMongo();

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
    console.log(`👉 Health check: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer();
