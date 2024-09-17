import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getDashboardStatsController } from '../controllers/adminController';

const router = express.Router();

router.use(authenticateToken);

router.get('/admin/dashboard', getDashboardStatsController);

export default router;
