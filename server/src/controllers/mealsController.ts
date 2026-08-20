import { Request, Response, NextFunction } from 'express';
import { createMeal, getMeals, deleteMeal, getMealById } from '../services/mealsService';
import { MealType } from '../types/meal';

export async function createMealHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meal = await createMeal(req.body);
    res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMealsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query.date as string | undefined;
    const mealType = req.query.mealType as MealType | undefined;

    const meals = await getMeals({ date, mealType });
    res.status(200).json({
      success: true,
      data: meals,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMealByIdHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const meal = await getMealById(id);

    if (!meal) {
      res.status(404).json({
        success: false,
        error: 'Meal not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMealHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await deleteMeal(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Meal not found or already deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Meal deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}
