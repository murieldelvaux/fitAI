import { Router } from 'express';
import { parseMealHandler } from '../controllers/llmController';
import { validateBody } from '../middleware/validateRequest';
import { parseMealRequestSchema } from '../schemas/llmSchema';

const router = Router();

// POST /llm/parse-meal
router.post('/parse-meal', validateBody(parseMealRequestSchema), parseMealHandler);

export default router;
