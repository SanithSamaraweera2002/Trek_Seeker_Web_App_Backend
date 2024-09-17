import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createDestinationController,
  getAllDestinationsController,
  getDestinationByIdController,
  updateDestinationController,
  deleteDestinationController,
} from '../controllers/destinationsController';

const router = express.Router();

router.use(authenticateToken);

router.post('/destinations', createDestinationController);
router.get('/destinations', getAllDestinationsController);
router.get('/destinations/:id', getDestinationByIdController);
router.put('/destinations/:id', updateDestinationController);
router.delete('/destinations/:id', deleteDestinationController);

export default router;
