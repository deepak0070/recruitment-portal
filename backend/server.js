const app = require('./app');
const config = require('./config');
const { testConnection } = require('./config/db.mysql');
const { connectMongo } = require('./config/db.mongo');

async function startServer() {
  console.log('--- Starting Recruitment Portal Server ---');

  // Test MySQL connection
  await testConnection();

  // Connect MongoDB
  await connectMongo();

  const server = app.listen(config.port, () => {
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
