import { Request, Response, NextFunction } from 'express';
import { getDailyNutrition, DEFAULT_GOALS } from '../services/nutritionService';
import { MacroGoals } from '../types/nutrition';

export async function getDailyNutritionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query.date as string | undefined;

    // Parse custom user goals if provided in query
    let customGoals: MacroGoals = DEFAULT_GOALS;
    if (req.query.calories || req.query.protein || req.query.carbs || req.query.fat) {
      customGoals = {
        calories: Number(req.query.calories) || DEFAULT_GOALS.calories,
        protein: Number(req.query.protein) || DEFAULT_GOALS.protein,
        carbs: Number(req.query.carbs) || DEFAULT_GOALS.carbs,
        fat: Number(req.query.fat) || DEFAULT_GOALS.fat,
      };
    }

    const summary = await getDailyNutrition(date, customGoals);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNutritionSummaryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query.date as string | undefined;
    const summary = await getDailyNutrition(date);
    res.status(200).json({
      success: true,
      data: {
        date: summary.date,
        calories: summary.calories,
        protein: summary.protein,
        carbs: summary.carbs,
        fat: summary.fat,
        mealsCount: summary.mealsCount,
        mealTypeBreakdown: summary.mealTypeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
}
