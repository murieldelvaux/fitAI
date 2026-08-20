import { Request, Response, NextFunction } from 'express';
import { searchFood } from '../services/foodsService';

export async function searchFoodHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = (req.query.q as string) || '';
    if (!query) {
      res.status(400).json({ error: 'Search query "q" is required' });
      return;
    }

    const food = await searchFood(query);
    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
}
