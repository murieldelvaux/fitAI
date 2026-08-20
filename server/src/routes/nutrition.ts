import { Router } from 'express';
import { getDailyNutritionHandler, getNutritionSummaryHandler } from '../controllers/nutritionController';

const router = Router();

// GET /nutrition/daily?date=2026-08-20
router.get('/daily', getDailyNutritionHandler);

// GET /nutrition/summary?date=2026-08-20
router.get('/summary', getNutritionSummaryHandler);

export default router;
