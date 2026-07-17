import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({ storage });
router.use('/uploads', requireAuth);

router.post('/uploads', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Ficheiro não enviado.' });
  }
  return res.status(201).json({
    file: {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: path.join('/uploads', req.file.filename),
    },
  });
});

export default router;
