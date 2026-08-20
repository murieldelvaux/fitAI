# FitAI — Intelligent Nutrition Tracking Assistant 🥗🤖

FitAI is a modern, full-stack nutrition tracking assistant that uses AI and natural language processing to interpret meal descriptions (e.g. *"Comi 200g de frango grelhado com batata doce e azeite"*), automatically calculate macronutrients (protein, carbs, fat, calories), track daily progress via animated rings and charts, and provide smart meal recommendations to fulfill daily dietary targets.

Designed with a premium dark-mode health aesthetic (*"Whoop meets MyFitnessPal"*).

---

## 🛠 Tech Stack

### Frontend (`/client`)
- **React 19 + TypeScript (Strict Mode)**
- **TanStack Query v5 (React Query)** — Server state management, caching, optimistic UI updates
- **React Router v6** — Client-side SPA routing
- **Tailwind CSS + Shadcn/ui** — Design system (`#0F172A` dark background, `#1E293B` cards, `#22C55E` accent green)
- **Zustand** — Client state with `localStorage` persistence for macro goals and session state
- **Recharts** — Macro distribution bar charts and cumulative calorie progress area charts
- **React Hook Form + Zod** — Type-safe form validation
- **Sonner** — Toast notifications
- **Lucide Icons** — Modern icon set

### Backend (`/server`)
- **Node.js + Express with TypeScript**
- **Zod** — Strict schema validation for request bodies, queries, and params via `validateRequest` middleware
- **Axios** — HTTP client for external integrations
- **CORS & Dotenv** — Configured for secure local development and environment isolation

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v22)
- npm `v9+` or `v10+`

### 1. Installation
Install all root, client, and server dependencies with a single command from the root directory:

```bash
npm install
```

### 2. Development Mode
Run both frontend and backend concurrently in dev mode:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Backend Health Check**: `http://localhost:3001/health`

### 3. Build & Typecheck
To typecheck and build both client and server:

```bash
# Typecheck
npm run typecheck

# Production Build
npm run build
```

---

## 📐 Project Architecture & Directory Structure

```
fit-ai/
├── package.json                   # Monorepo root with concurrently scripts
├── README.md                      # Documentation & Setup Guide
├── client/                        # React 19 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Shadcn/ui base primitives (Button, Card, Input, Textarea, Badge, Progress, etc.)
│   │   │   ├── layout/            # AppShell, Sidebar, Header (responsive navigation)
│   │   │   ├── nutrition/         # MealInputCard (NLP/AI), MacroProgressRing, DailyLogList, MealCard, NutritionSummary
│   │   │   ├── recommendations/   # RecommendationCard, RecommendationList
│   │   │   └── charts/            # MacroBarChart, CalorieProgressChart
│   │   ├── hooks/                 # useDailyLog, useMealParse, useFoodSearch, useRecommendations
│   │   ├── pages/                 # Dashboard, MealLog, Goals, Recommendations
│   │   ├── services/              # api.ts, nutritionService.ts, mealService.ts, llmService.ts, foodService.ts
│   │   ├── store/                 # useGoalsStore (persisted in localStorage), useDailyStore
│   │   ├── types/                 # meal.ts, nutrition.ts, food.ts, recommendation.ts, llm.ts
│   │   └── lib/                   # queryClient.ts, utils.ts
└── server/                        # Node.js + Express Backend
    ├── src/
    │   ├── routes/                # meals.ts, nutrition.ts, foods.ts, recommendations.ts, llm.ts
    │   ├── controllers/           # mealsController, nutritionController, foodsController, recommendationsController, llmController
    │   ├── services/              # mealsService, nutritionService, foodsService (stub), recommendationsService, llmService (stub)
    │   ├── middleware/            # errorHandler, validateRequest, cors
    │   ├── schemas/               # mealSchema, foodSchema, llmSchema (Zod schemas)
    │   ├── data/                  # mockFoods.ts (nutrition database with 30+ items)
    │   └── types/                 # Mirrored TypeScript interfaces
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/llm/parse-meal` | Interprets natural language description into structured food items and portion sizes |
| `GET` | `/foods/search?q=chicken` | Searches food item and returns nutritional profile per 100g / serving |
| `GET` | `/meals?date=YYYY-MM-DD` | Returns logged meals for the specified date |
| `POST` | `/meals` | Saves a new meal with items and calculated macronutrients |
| `DELETE`| `/meals/:id` | Deletes a meal by ID |
| `GET` | `/nutrition/daily?date=YYYY-MM-DD` | Calculates consumed totals, remaining deficit, and percentages against goals |
| `GET` | `/recommendations` | Returns 3–5 tailored meal suggestions to complete remaining daily macro targets |

---

## 💡 Key Features & User Flows

1. **AI Natural Language Meal Logging**:
   - Type in natural Portuguese or English: *"Comi 200g de frango grelhado com batata doce e azeite"*.
   - The AI identifies individual food items, weights, and units, enriches them with nutritional metrics, and logs the meal instantly with optimistic UI feedback and toast notifications.
2. **Interactive Macro Progress Rings**:
   - 4 animated circular SVG rings: **Protein** (Blue), **Carbohydrates** (Amber), **Fat** (Rose), and **Calories** (Emerald).
   - Real-time percentage tracking and remaining grams calculations against customizable targets.
3. **Smart Meal Recommendations**:
   - Evaluates remaining calorie and macro deficits and suggests actionable meals (e.g. *Grilled Salmon Quinoa Bowl*, *High-Protein Greek Yogurt Parfait*).
   - One-click **"Registrar Esta Refeição"** button automatically logs the suggestion into today's meals.
4. **Customizable Macro Goals**:
   - Goal configuration with presets (*Hipertrofia*, *Definição*, *Manutenção*) or manual values, validated via Zod and persisted in `localStorage`.
5. **Interactive Charts**:
   - **Recharts** bar chart displaying macro distributions across individual meals.
   - Cumulative calorie progression curve tracking intake timeline towards the daily budget.

---

## 📝 TODO: Integrations (For Developers)

The application is structured to allow seamless plug-and-play integration with live LLM providers and the official OpenFoodFacts database. The integration points are isolated in the following service files:

### 1. LLM Integration (`server/src/services/llmService.ts`)
```typescript
// TODO: Implement LLM integration
// This service should call your preferred LLM provider (e.g., OpenAI, Gemini, Claude)
// to parse natural language meal descriptions into structured food items.
// Expected input: string (raw user input)
// Expected output: ParsedMealResponse (see llmSchema.ts)
export async function parseMeal(input: string): Promise<ParsedMealResponse> {
  // Replace stub with actual LLM API call:
  // e.g., using @google/genai or openai SDK with structured JSON output schema.
}
```

### 2. OpenFoodFacts Integration (`server/src/services/foodsService.ts`)
```typescript
// TODO: Implement OpenFoodFacts API integration
// Docs: https://wiki.openfoodfacts.org/API
// Base URL: https://world.openfoodfacts.org/cgi/search.pl
// This service should search for a food item and return its nutritional info per 100g.
// Expected input: string (food name)
// Expected output: FoodNutrition (see foodSchema.ts)
export async function searchFood(query: string): Promise<FoodNutrition> {
  // Replace stub with actual Axios call to OpenFoodFacts REST API:
  // const res = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`);
}
```

---

## 📄 License
MIT © 2026 FitAI Team.
# fitAI
