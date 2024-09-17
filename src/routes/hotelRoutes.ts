import express from 'express';
import { getHotelsForMultipleDaysController } from '../controllers/hotelController';

const router = express.Router();

router.post('/hotels/recommendations', getHotelsForMultipleDaysController);

export default router;
