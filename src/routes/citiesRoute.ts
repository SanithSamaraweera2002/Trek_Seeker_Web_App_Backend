import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createCityController,
  getAllCitiesController,
  getCityByIdController,
  updateCityController,
  deleteCityController,
} from '../controllers/citiesController';

const router = Router();

router.use(authenticateToken);

router.post('/city', createCityController);
router.get('/cities', getAllCitiesController);
router.get('/city/:id', getCityByIdController);
router.put('/city/:id', updateCityController);
router.delete('/city/:id', deleteCityController);

export default router;
