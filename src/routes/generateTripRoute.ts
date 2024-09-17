import { Router } from 'express';
import { generateTripController } from '../controllers/generateTripController';

const router = Router();

router.post('/generate-trip', generateTripController);

export default router;
