import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  registerTravelerController,
  getAllTravelersController,
  getTravelerByIdController,
  updateTravelerController,
  deleteTravelerController,
  getAllTravelersListController,
} from '../controllers/travelerController';

const router = Router();

router.post('/traveler/register', registerTravelerController);
router.get('/travelers', authenticateToken, getAllTravelersController);
router.get('/travelers/all', getAllTravelersListController);
router.get('/traveler/:id', authenticateToken, getTravelerByIdController);
router.put('/traveler/:id', authenticateToken, updateTravelerController);
router.delete('/traveler/:id', authenticateToken, deleteTravelerController);

export default router;
