import fs from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { createRealtimeServer } from './realtime/socket.js';
import { query } from './db/pool.js';

const app = express();
const httpServer = http.createServer(app);
createRealtimeServer(httpServer, env.corsOrigins);

fs.mkdirSync(env.uploadDir, { recursive: true });

const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

function resolveCorsOrigin(origin, callback) {
  // Requests without an Origin header (curl, server-to-server, health checks) are always allowed.
  if (!origin) return callback(null, true);

  if (env.corsOrigins.includes(origin)) return callback(null, true);

  // In development, be permissive about the *port* so local setups that run the
  // frontend directly (vite on 5173) or behind nginx (8080) both work without
  // needing to hand-tune CORS_ORIGIN every time.
  if (env.nodeEnv !== 'production' && isLocalhostOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`Origin não permitida pelo CORS: ${origin}`));
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: resolveCorsOrigin, credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(env.uploadDir)));
app.use('/api', apiRouter);
app.use(errorHandler);

async function bootstrap() {
  await query('SELECT 1');
  httpServer.listen(env.port, () => {
    console.log(`Techsim backend listening on :${env.port}`);
  });
}

bootstrap().catch(error => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
