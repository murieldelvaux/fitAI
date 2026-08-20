import { Request, Response, NextFunction } from 'express';
import { getRecommendations } from '../services/recommendationsService';
import { DEFAULT_GOALS } from '../services/nutritionService';
import { MacroGoals } from '../types/nutrition';

export async function getRecommendationsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query.date as string | undefined;

    let customGoals: MacroGoals = DEFAULT_GOALS;
    if (req.query.calories || req.query.protein || req.query.carbs || req.query.fat) {
      customGoals = {
        calories: Number(req.query.calories) || DEFAULT_GOALS.calories,
        protein: Number(req.query.protein) || DEFAULT_GOALS.protein,
        carbs: Number(req.query.carbs) || DEFAULT_GOALS.carbs,
        fat: Number(req.query.fat) || DEFAULT_GOALS.fat,
      };
    }

    const recommendations = await getRecommendations(date, customGoals);
    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}
