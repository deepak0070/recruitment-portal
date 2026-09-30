const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'recruitment_portal_super_secret_jwt_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'recruitment_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recruitment_portal'
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: path.resolve(__dirname, '../uploads/resumes'),
  externalJobs: {
    adzuna: {
      appId: process.env.ADZUNA_APP_ID || '',
      appKey: process.env.ADZUNA_APP_KEY || '',
      country: process.env.ADZUNA_COUNTRY || 'in' // dedicated India endpoint
    },
    jooble: {
      apiKey: process.env.JOOBLE_API_KEY || ''
    },
    careerjet: {
      affId: process.env.CAREERJET_AFFID || ''
    }
  }
};
