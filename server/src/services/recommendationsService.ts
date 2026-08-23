import * as tf from '@tensorflow/tfjs-node';
import { MealRecommendation, RecommendationsResponse } from '../types/recommendation';
import { DailyNutritionSummary, MacroGoals } from '../types/nutrition';
import { DEFAULT_GOALS, getDailyNutrition } from './nutritionService';
import { FoodNutrition } from '../types/food';
import { listFoods } from './foodsService';

// create weights for the model
// [MODIFIED]: Tuned weights for balanced normalization and ACTIVATED mealType (previously 0.0, which zeroed category features)
const WEIGHTS = {
  totalCalories: 0.25,
  totalProtein: 0.35,
  totalCarbs: 0.20,
  totalFat: 0.20,
  mealType: 0.30, // Activation of category one-hot influence in model embeddings
};

// [MODIFIED]: More flexible and realistic macronutrient distribution ranges for fitness foods
function isBalanced(meal: FoodNutrition): boolean {
  const totalCalories = meal.calories;
  if (totalCalories <= 0) return false;

  const carbsCalories = meal.carbs * 4;   // 1g carb = 4 kcal
  const proteinCalories = meal.protein * 4; // 1g protein = 4 kcal
  const fatCalories = meal.fat * 9;     // 1g fat = 9 kcal

  const carbsPct = carbsCalories / totalCalories;
  const proteinPct = proteinCalories / totalCalories;
  const fatPct = fatCalories / totalCalories;

  // Healthy balanced ranges (expanded AMDR)
  return (
    carbsPct >= 0.30 && carbsPct <= 0.65 &&
    proteinPct >= 0.15 && proteinPct <= 0.40 &&
    fatPct >= 0.15 && fatPct <= 0.40
  );
}

// [MODIFIED]: Reorganized hierarchy and criteria for category inference
// Fixes previous shadowing where carbs <= 40 captured almost all foods before other categories
function inferCategory(
  food: FoodNutrition
): MealRecommendation['category'] {
  const totalCalories = food.calories || 1;
  const proteinCalories = food.protein * 4;
  const carbsCalories = food.carbs * 4;
  const proteinRatio = proteinCalories / totalCalories;
  const carbsRatio = carbsCalories / totalCalories;

  // 1. Post-Workout: Requires consistent protein (>= 12g) AND moderate/high carbs (>= 15g) for recovery
  if (food.protein >= 12 && food.carbs >= 15 && food.calories <= 550) {
    return 'post_workout';
  }

  // 2. High Protein: High protein density (>= 18g protein or >= 30% of total calories)
  if (food.protein >= 18 || proteinRatio >= 0.30) {
    return 'high_protein';
  }

  // 3. Quick Snack: Low calories (<= 250 kcal) and light portion
  if (food.calories > 0 && food.calories <= 250 && food.protein < 15) {
    return 'quick_snack';
  }

  // 4. Low Carb: Strictly low carbohydrates (carbs <= 12g or <= 20% of calories)
  if (food.carbs <= 12 || carbsRatio <= 0.20) {
    return 'low_carb';
  }

  // 5. Balanced: Harmonious macro distribution
  if (isBalanced(food)) {
    return 'balanced';
  }

  return 'balanced';
}

// step 0: build the candidate list from real food data
// [MODIFIED]: Added sanitization of real API data (eliminates unrealistic outliers like 7220 kcal/100g)
async function getCandidateFoods(): Promise<MealRecommendation[]> {
  const foods = await listFoods();

  if (!Array.isArray(foods) || foods.length === 0) {
    console.warn('[Recommendations] listFoods returned empty or invalid data');
    return [];
  }

  const seen = new Set<string>();
  const result: MealRecommendation[] = [];

  for (const food of foods) {
    if (!food.name || seen.has(food.name)) continue;

    // [ADDED]: Sanitize real data (discards corrupted items with calories > 950 kcal/100g or negative values)
    if (food.calories > 950 || food.calories < 0 || food.protein < 0 || food.carbs < 0 || food.fat < 0) {
      continue;
    }

    seen.add(food.name);

    result.push({
      id: food.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: food.name,
      description: `${food.calories} kcal · ${food.protein}g prot · ${food.carbs}g carbs · ${food.fat}g fat per ${food.servingSize}${food.servingUnit}`,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      category: inferCategory(food),
      whyItFits: 'Ajuda a complementar seus objetivos de macronutrientes.',
      prepTimeMinutes: food.calories <= 250 ? 5 : 15,
      ingredients: [
        {
          name: food.name,
          quantity: food.servingSize,
          unit: food.servingUnit,
          nutrition: food,
        },
      ],
    });
  }

  return result;
}

let _globalCtx: ReturnType<typeof makeContext> | null = null;
let _model: tf.Sequential | null = null;

// step 1: categorize important features and create a context for the model
const oneHotWeighted = (index: number, length: number, weight: number) =>
  tf.oneHot(index, length).cast('float32').mul(weight);

// function to prepare data - create context for the model
// IMPORTANT:
// the context must use the candidate meals, not the meals already consumed in the day
// [MODIFIED]: Guarantees consistent normalization bounds and supports all 5 canonical categories
function makeContext(dailyNutrition: DailyNutritionSummary, candidates: MealRecommendation[]) {
  const totalCalories = candidates.map(meal => meal.calories);
  const totalProtein = candidates.map(meal => meal.protein);
  const totalCarbs = candidates.map(meal => meal.carbs);
  const totalFat = candidates.map(meal => meal.fat);

  const minCalories = Math.min(...totalCalories, 0);
  const minProtein = Math.min(...totalProtein, 0);
  const minCarbs = Math.min(...totalCarbs, 0);
  const minFat = Math.min(...totalFat, 0);

  // [MODIFIED]: Establishes realistic maximum bounds to prevent distorted division from extreme data
  const maxCalories = Math.max(...totalCalories, 600);
  const maxProtein = Math.max(...totalProtein, 40);
  const maxCarbs = Math.max(...totalCarbs, 80);
  const maxFat = Math.max(...totalFat, 40);

  // Ensure canonical list of all supported categories
  const canonicalCategories: MealRecommendation['category'][] = [
    'high_protein',
    'low_carb',
    'balanced',
    'quick_snack',
    'post_workout',
  ];

  const presentCategories = [...new Set(candidates.map(meal => meal.category))];
  const categories = canonicalCategories.filter(c => presentCategories.includes(c));
  if (categories.length === 0) categories.push(...canonicalCategories);

  // create index to category
  const categoryIndex = Object.fromEntries(
    categories.map((category, index) => [category, index])
  );

  console.log(
    'makeContext: minCalories, minProtein, minCarbs, minFat, maxCalories, maxProtein, maxCarbs, maxFat',
    minCalories, minProtein, minCarbs, minFat, maxCalories, maxProtein, maxCarbs, maxFat
  );

  return {
    dailyNutrition,
    candidates,
    minCalories,
    minProtein,
    minCarbs,
    minFat,
    maxCalories,
    maxProtein,
    maxCarbs,
    maxFat,
    categories,
    categoryIndex,
    numCategories: categories.length,
    dimensions: 4 + categories.length, // calories, protein, carbs, fat + one-hot category
  };
}

// step 2: create a tensor and normalize it
// normalize the input data to be between 0 and 1
const normalize = (value: number, min: number, max: number) => {
  const span = max - min;
  if (span <= 0) return 0.5;
  const clamped = Math.max(min, Math.min(max, value));
  return (clamped - min) / span;
};

// step 2: encode the candidate meal
// this is the equivalent of encodeProduct in the recommendation flow
function encodeRecommendationMeal(
  meal: MealRecommendation,
  context: ReturnType<typeof makeContext>
) {
  const calories = tf.tensor1d([
    normalize(meal.calories, context.minCalories, context.maxCalories),
  ]).mul(WEIGHTS.totalCalories).as1D();

  const protein = tf.tensor1d([
    normalize(meal.protein, context.minProtein, context.maxProtein),
  ]).mul(WEIGHTS.totalProtein).as1D();

  const carbs = tf.tensor1d([
    normalize(meal.carbs, context.minCarbs, context.maxCarbs),
  ]).mul(WEIGHTS.totalCarbs).as1D();

  const fat = tf.tensor1d([
    normalize(meal.fat, context.minFat, context.maxFat),
  ]).mul(WEIGHTS.totalFat).as1D();

  // here category plays the role of the categorical feature
  const catIdx = context.categoryIndex[meal.category] ?? 0;
  const category = oneHotWeighted(
    catIdx,
    context.numCategories,
    WEIGHTS.mealType
  ).as1D();

  return tf.concat1d([calories, protein, carbs, fat, category]);
}

// step 2.1: encode daily nutrition
// this is the equivalent of the "user vector"
// here we use the remaining values, because the recommendation must know what is still missing
// [MODIFIED]: Protection against division by zero or negative deficit values
function encodeDailyNutrition(dailyNutrition: DailyNutritionSummary) {
  const calRatio = Math.max(0, dailyNutrition.calories.remaining) / Math.max(1, dailyNutrition.calories.target);
  const protRatio = Math.max(0, dailyNutrition.protein.remaining) / Math.max(1, dailyNutrition.protein.target);
  const carbsRatio = Math.max(0, dailyNutrition.carbs.remaining) / Math.max(1, dailyNutrition.carbs.target);
  const fatRatio = Math.max(0, dailyNutrition.fat.remaining) / Math.max(1, dailyNutrition.fat.target);

  const calories = tf.tensor1d([Math.min(2.0, calRatio)]).mul(WEIGHTS.totalCalories).as1D();
  const protein = tf.tensor1d([Math.min(2.0, protRatio)]).mul(WEIGHTS.totalProtein).as1D();
  const carbs = tf.tensor1d([Math.min(2.0, carbsRatio)]).mul(WEIGHTS.totalCarbs).as1D();
  const fat = tf.tensor1d([Math.min(2.0, fatRatio)]).mul(WEIGHTS.totalFat).as1D();

  return tf.concat1d([calories, protein, carbs, fat]);
}

// [ADDED]: Helper function to evaluate continuous fitness compatibility between daily deficit and candidate food
function computeFitnessScore(
  candidate: MealRecommendation,
  daily: DailyNutritionSummary
): number {
  const remCal = Math.max(50, daily.calories.remaining);
  const remProt = Math.max(5, daily.protein.remaining);
  const remCarbs = Math.max(5, daily.carbs.remaining);
  const remFat = Math.max(2, daily.fat.remaining);

  // Proportion of deficit that the food fills (ideal: 20% to 50% in a single meal)
  const calRatio = candidate.calories / remCal;
  const protRatio = candidate.protein / remProt;
  const carbsRatio = candidate.carbs / remCarbs;
  const fatRatio = candidate.fat / remFat;

  // Calorie adequacy score (penalizes exceeding 80% or negligible < 5%)
  let calScore = 1.0 - Math.abs(calRatio - 0.35) * 2;
  calScore = Math.max(0, Math.min(1, calScore));

  // Protein adequacy score (rewards filling protein without blowing daily limit)
  let protScore = 1.0 - Math.abs(protRatio - 0.40) * 1.5;
  protScore = Math.max(0, Math.min(1, protScore));

  // Fat excess penalty
  const fatPenalty = fatRatio > 0.7 ? (fatRatio - 0.7) * 0.5 : 0;

  // Category synergy score
  let categorySynergy = 0.5;
  if (protRatio >= 0.3 && (candidate.category === 'high_protein' || candidate.category === 'post_workout')) {
    categorySynergy = 0.9;
  } else if (calRatio <= 0.25 && candidate.category === 'quick_snack') {
    categorySynergy = 0.85;
  } else if (carbsRatio <= 0.2 && candidate.category === 'low_carb') {
    categorySynergy = 0.85;
  } else if (candidate.category === 'balanced') {
    categorySynergy = 0.8;
  }

  const finalScore = (calScore * 0.3) + (protScore * 0.4) + (categorySynergy * 0.3) - fatPenalty;
  return Math.max(0, Math.min(1, finalScore));
}

// step 3: create a function to prepare data for training
// IMPORTANT:
// the training example must be daily state + candidate meal
// [MODIFIED]: Generates diverse training scenarios and balances positive/negative classes (50/50),
// resolving the issue where accuracy remained frozen at 80.6% due to severe class imbalance.
function createTrainingData(
  dailyNutrition: DailyNutritionSummary,
  candidates: MealRecommendation[],
  context: ReturnType<typeof makeContext>
) {
  const input: number[][] = [];
  const labels: number[] = [];

  // [ADDED]: Synthetic scenarios representing varied daily nutritional states
  // Allows the neural network to generalize rather than overfitting to a single static instant
  const createScenario = (
    cTarget: number, cConsumed: number,
    pTarget: number, pConsumed: number,
    cbTarget: number, cbConsumed: number,
    fTarget: number, fConsumed: number
  ): DailyNutritionSummary => ({
    date: '2026-08-23',
    calories: { target: cTarget, consumed: cConsumed, remaining: Math.max(0, cTarget - cConsumed), percentage: Math.round((cConsumed / cTarget) * 100) },
    protein: { target: pTarget, consumed: pConsumed, remaining: Math.max(0, pTarget - pConsumed), percentage: Math.round((pConsumed / pTarget) * 100) },
    carbs: { target: cbTarget, consumed: cbConsumed, remaining: Math.max(0, cbTarget - cbConsumed), percentage: Math.round((cbConsumed / cbTarget) * 100) },
    fat: { target: fTarget, consumed: fConsumed, remaining: Math.max(0, fTarget - fConsumed), percentage: Math.round((fConsumed / fTarget) * 100) },
    mealsCount: 2,
    meals: [],
    mealTypeBreakdown: {
      breakfast: { calories: 300, count: 1 },
      lunch: { calories: 500, count: 1 },
      snack: { calories: 0, count: 0 },
      dinner: { calories: 0, count: 0 },
      supper: { calories: 0, count: 0 },
    },
  });

  const trainingScenarios: DailyNutritionSummary[] = [
    dailyNutrition,
    // Scenario 1: High protein requirement (morning/midday)
    createScenario(2000, 800, 150, 40, 200, 100, 60, 25),
    // Scenario 2: Post-workout (requires protein and carbohydrates)
    createScenario(2200, 1200, 160, 70, 250, 110, 65, 40),
    // Scenario 3: End of day / light snack (few remaining calories)
    createScenario(1800, 1550, 130, 115, 180, 155, 50, 42),
    // Scenario 4: Low carb remaining (limited carb allowance)
    createScenario(2000, 1300, 140, 70, 150, 135, 70, 40),
    // Scenario 5: Balanced deficit
    createScenario(2000, 1000, 140, 70, 220, 110, 60, 30),
  ];

  // Precompute vectors for each candidate
  const candidateVectors = candidates.map(candidate => ({
    candidate,
    vector: Array.from(encodeRecommendationMeal(candidate, context).dataSync()),
  }));

  // Build training pairs for each scenario
  trainingScenarios.forEach((scenario) => {
    const dailyVector = Array.from(encodeDailyNutrition(scenario).dataSync());

    // Evaluate continuous compatibility scores
    const scenarioScored = candidateVectors.map(cv => ({
      candidateVector: cv.vector,
      score: computeFitnessScore(cv.candidate, scenario),
    }));

    // [MODIFIED]: Adaptive median thresholding guarantees exact 50/50 class balance
    const sortedScores = [...scenarioScored.map(s => s.score)].sort((a, b) => a - b);
    const medianScore = sortedScores[Math.floor(sortedScores.length / 2)] || 0.5;

    scenarioScored.forEach(({ candidateVector, score }) => {
      input.push([...dailyVector, ...candidateVector]);
      labels.push(score >= medianScore ? 1 : 0);
    });
  });

  console.log(
    `[Recommendations] Training data created with ${input.length} samples (${labels.filter(l => l === 1).length} pos, ${labels.filter(l => l === 0).length} neg)`
  );

  return {
    xs: tf.tensor2d(input),
    ys: tf.tensor2d(labels, [labels.length, 1]),
    inputDimensions: input[0].length,
  };
}

// [MODIFIED]: Tuned neural network architecture with heNormal initialization and learning rate 0.003
async function configureNeuralNetworkAndTrain(
  trainData: ReturnType<typeof createTrainingData>
) {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [trainData.inputDimensions],
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  );
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({
    optimizer: tf.train.adam(0.003),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  await model.fit(trainData.xs, trainData.ys, {
    epochs: 40,
    batchSize: 16,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${(logs?.acc ?? logs?.accuracy)?.toFixed(4)}`
        );
      },
    },
  });

  return model;
}

// step E: use the trained model to score each candidate and build the response
// [MODIFIED]: Groups and returns 5 meal options for EACH category classified by inferCategory
function scoreAndRankCandidates(
  model: tf.Sequential,
  candidates: MealRecommendation[],
  context: ReturnType<typeof makeContext>,
  dailyNutrition: DailyNutritionSummary,
  topNPerCategory = 5
): MealRecommendation[] {
  const dailyVector = Array.from(encodeDailyNutrition(dailyNutrition).dataSync());

  // 1. Predict AI model score for all candidate foods
  const scored = candidates.map((candidate) => {
    const candidateVector = Array.from(
      encodeRecommendationMeal(candidate, context).dataSync()
    );

    const inputTensor = tf.tensor2d([[...dailyVector, ...candidateVector]]);
    const scoreTensor = model.predict(inputTensor) as tf.Tensor;
    const modelScore = scoreTensor.dataSync()[0];

    // Dispose tensors immediately to prevent memory leaks
    inputTensor.dispose();
    scoreTensor.dispose();

    // Combine neural network score with macronutrient suitability heuristic
    const heuristicScore = computeFitnessScore(candidate, dailyNutrition);
    const combinedScore = (modelScore * 0.7) + (heuristicScore * 0.3);

    // Build dynamic whyItFits message based on how the meal complements goals
    const whyItFits = buildWhyItFits(candidate, dailyNutrition);

    return {
      candidate: { ...candidate, whyItFits },
      score: combinedScore,
      category: candidate.category,
    };
  });

  // 2. [ADDED]: Grouping and selection of top N (5) options for EACH category
  const categoriesList: MealRecommendation['category'][] = [
    'high_protein',
    'low_carb',
    'balanced',
    'quick_snack',
    'post_workout',
  ];

  const finalRecommendations: MealRecommendation[] = [];

  categoriesList.forEach((category) => {
    // Filter candidates belonging to this category
    const categoryCandidates = scored.filter((item) => item.category === category);

    // Sort descending by AI score
    categoryCandidates.sort((a, b) => b.score - a.score);

    // Select top N options for the current category
    const topForCategory = categoryCandidates
      .slice(0, topNPerCategory)
      .map(({ candidate }) => candidate);

    finalRecommendations.push(...topForCategory);
  });

  return finalRecommendations;
}

// [MODIFIED]: Detailed, personalized whyItFits messages
function buildWhyItFits(
  candidate: MealRecommendation,
  dailyNutrition: DailyNutritionSummary
): string {
  const reasons: string[] = [];

  const remProt = Math.max(1, dailyNutrition.protein.remaining);
  const remCal = Math.max(1, dailyNutrition.calories.remaining);

  const protFill = (candidate.protein / remProt) * 100;
  const calFill = (candidate.calories / remCal) * 100;

  if (protFill >= 15 && protFill <= 90) {
    reasons.push(`cobre ~${Math.round(protFill)}% da proteína restante`);
  }
  if (calFill >= 10 && calFill <= 75) {
    reasons.push(`cobre ~${Math.round(calFill)}% das calorias restantes`);
  }
  if (candidate.fat <= dailyNutrition.fat.remaining + 2) {
    reasons.push('dentro da meta de gordura');
  }

  if (reasons.length > 0) {
    return reasons.join(', ') + '.';
  }

  switch (candidate.category) {
    case 'high_protein':
      return `Excelente fonte de proteínas (${candidate.protein}g) para bater sua meta diária.`;
    case 'post_workout':
      return `Combinação ideal de proteína (${candidate.protein}g) e energia para recuperação muscular.`;
    case 'quick_snack':
      return `Opção leve e rápida (${candidate.calories} kcal) sem pesar no total do dia.`;
    case 'low_carb':
      return `Baixo teor de carboidratos (${candidate.carbs}g), ideal para manter o controle glicêmico.`;
    default:
      return 'Ajuda a equilibrar seus macronutrientes de forma harmoniosa.';
  }
}

export async function getRecommendations(
  dateStr?: string,
  customGoals: MacroGoals = DEFAULT_GOALS
): Promise<RecommendationsResponse> {
  return trainModel(dateStr, customGoals);
}

export async function trainModel(
  dateStr?: string,
  customGoals: MacroGoals = DEFAULT_GOALS
): Promise<RecommendationsResponse> {
  // step A: current daily nutrition state
  const dailyNutrition = await getDailyNutrition(dateStr, customGoals);

  // step B: candidates and context
  const candidates = await getCandidateFoods();

  if (candidates.length === 0) {
    return {
      recommendations: [],
      macroDeficit: {
        calories: dailyNutrition.calories.remaining,
        protein: dailyNutrition.protein.remaining,
        carbs: dailyNutrition.carbs.remaining,
        fat: dailyNutrition.fat.remaining,
      },
    };
  }

  const context = makeContext(dailyNutrition, candidates);
  _globalCtx = context;

  // step C: training data
  const trainingData = createTrainingData(dailyNutrition, candidates, context);

  // step D: train the model
  _model = await configureNeuralNetworkAndTrain(trainingData);

  // step E: infer scores and return the ranked top N per category (5 options per category)
  const recommendations = scoreAndRankCandidates(
    _model,
    candidates,
    context,
    dailyNutrition,
    5
  );

  console.log(
    `[Recommendations] Generated ${recommendations.length} recommendations across categories:`,
    recommendations.map((r) => `${r.name} [${r.category}]`)
  );

  return {
    recommendations,
    macroDeficit: {
      calories: dailyNutrition.calories.remaining,
      protein: dailyNutrition.protein.remaining,
      carbs: dailyNutrition.carbs.remaining,
      fat: dailyNutrition.fat.remaining,
    },
  };
}