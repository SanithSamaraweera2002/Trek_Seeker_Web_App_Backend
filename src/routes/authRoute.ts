import { Router } from 'express';
import {
  loginUserController,
  sendPasswordResetController,
  resetPasswordController,
} from '../controllers/authController';

const router = Router();

router.post('/login', loginUserController);
router.post('/forgot-password', sendPasswordResetController);
router.post('/reset-password', resetPasswordController);

export default router;
