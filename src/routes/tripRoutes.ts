import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createTripController,
  getAllTripsController,
  getTripByIdController,
  deleteTripController,
} from '../controllers/tripController';

const router = Router();

router.use(authenticateToken);

router.post('/trips', createTripController);
router.get('/trips/:travelerId', getAllTripsController);
router.get('/trips/details/:id', getTripByIdController);
router.delete('/trips/:id', deleteTripController);

export default router;
