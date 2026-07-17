import { Router } from 'express';
import authRoutes from './auth.js';
import healthRoutes from './health.js';
import librariesRoutes from './libraries.js';
import projectsRoutes from './projects.js';
import uploadsRoutes from './uploads.js';

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(librariesRoutes);
router.use(projectsRoutes);
router.use(uploadsRoutes);

export default router;
