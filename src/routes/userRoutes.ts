import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from '../controllers/userController';

const router = Router();

router.post('/users', authenticateToken, createUserController);
router.get('/users', authenticateToken, getAllUsersController);
router.get('/users/:id', authenticateToken, getUserByIdController);
router.put('/users/:id', authenticateToken, updateUserController);
router.delete('/users/:id', authenticateToken, deleteUserController);

export default router;
