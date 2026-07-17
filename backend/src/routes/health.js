import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const db = await query('SELECT NOW() AS now');
  res.json({
    status: 'ok',
    database: 'up',
    now: db.rows[0]?.now,
  });
});

export default router;
