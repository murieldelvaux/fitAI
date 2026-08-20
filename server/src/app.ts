import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';

// Import route modules
import llmRoutes from './routes/llm';
import foodsRoutes from './routes/foods';
import mealsRoutes from './routes/meals';
import nutritionRoutes from './routes/nutrition';
import recommendationsRoutes from './routes/recommendations';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'FitAI API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/llm', llmRoutes);
app.use('/foods', foodsRoutes);
app.use('/meals', mealsRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/recommendations', recommendationsRoutes);

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
