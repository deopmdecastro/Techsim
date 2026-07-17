import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env' });

const csv = (value = '') => value.split(',').map(item => item.trim()).filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  corsOrigins: csv(process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8080'),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'techsim',
    user: process.env.POSTGRES_USER || 'techsim',
    password: process.env.POSTGRES_PASSWORD || 'techsim',
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  uploadDir: process.env.UPLOAD_DIR || 'backend/uploads',
};

export const isProd = env.nodeEnv === 'production';
