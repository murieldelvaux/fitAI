import { Request, Response, NextFunction } from 'express';
import { parseMeal } from '../services/llmService';

export async function parseMealHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;
    const parsed = await parseMeal(input);
    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    next(error);
  }
}
