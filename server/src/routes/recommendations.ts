import { Router } from 'express';
import { getRecommendationsHandler } from '../controllers/recommendationsController';

const router = Router();

// GET /recommendations
router.get('/', getRecommendationsHandler);

export default router;
