import { Router } from 'express';
import {
  createMealHandler,
  getMealsHandler,
  getMealByIdHandler,
  deleteMealHandler,
} from '../controllers/mealsController';
import { validateBody, validateParams, validateQuery } from '../middleware/validateRequest';
import { createMealSchema, deleteMealParamsSchema, getMealsQuerySchema } from '../schemas/mealSchema';

const router = Router();

// GET /meals
router.get('/', validateQuery(getMealsQuerySchema), getMealsHandler);

// POST /meals
router.post('/', validateBody(createMealSchema), createMealHandler);

// GET /meals/:id
router.get('/:id', validateParams(deleteMealParamsSchema), getMealByIdHandler);

// DELETE /meals/:id
router.delete('/:id', validateParams(deleteMealParamsSchema), deleteMealHandler);

export default router;
