import { Router } from 'express';
import { searchFoodHandler } from '../controllers/foodsController';
import { validateQuery } from '../middleware/validateRequest';
import { foodSearchQuerySchema } from '../schemas/foodSchema';

const router = Router();

// GET /foods/search?q=chicken
router.get('/search', validateQuery(foodSearchQuerySchema), searchFoodHandler);

export default router;
