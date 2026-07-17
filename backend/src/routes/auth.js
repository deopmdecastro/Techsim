import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { signAccessToken } from '../services/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { writeAuditLog } from '../db/audit.js';

const router = Router();

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (exists.rowCount) {
    return res.status(409).json({ message: 'Já existe uma conta com este e-mail.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name.trim(), email.toLowerCase(), passwordHash]
  );

  const user = mapUser(result.rows[0]);
  const token = signAccessToken(user);
  await writeAuditLog({ userId: user.id, action: 'register', entityType: 'user', entityId: user.id });
  return res.status(201).json({ user, token });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const userRow = result.rows[0];
  if (!userRow) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const valid = await bcrypt.compare(password, userRow.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const user = mapUser(userRow);
  const token = signAccessToken(user);
  await writeAuditLog({ userId: user.id, action: 'login', entityType: 'user', entityId: user.id });
  return res.json({ user, token });
});

router.get('/auth/me', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [req.user.sub]
  );
  const userRow = result.rows[0];
  if (!userRow) {
    return res.status(404).json({ message: 'Utilizador não encontrado.' });
  }
  return res.json({ user: mapUser(userRow) });
});

export default router;
