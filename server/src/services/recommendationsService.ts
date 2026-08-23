import * as tf from '@tensorflow/tfjs-node';
import { MealRecommendation, RecommendationsResponse } from '../types/recommendation';
import { DailyNutritionSummary, MacroGoals } from '../types/nutrition';
import { Meal } from '../types/meal';
import { DEFAULT_GOALS, getDailyNutrition } from './nutritionService';
import { FoodNutrition } from '../types/food';
import { listFoods } from './foodsService';

// create weigths for the model
const WEIGHTS = {  
  totalCalories: 0.5,
  totalProtein: 0.3,
  totalCarbs: 0.2,
  totalFat: 0.1,
  mealType: 0.1,
}

function isBalanced(meal: FoodNutrition): boolean {
  const totalCalories = meal.calories;
  if (totalCalories === 0) return false;

  const carbsCalories    = meal.carbs * 4;   // 1g carb = 4 kcal
  const proteinCalories  = meal.protein * 4; // 1g proteína = 4 kcal
  const fatCalories      = meal.fat * 9;     // 1g gordura = 9 kcal

  const carbsPct   = carbsCalories / totalCalories;
  const proteinPct = proteinCalories / totalCalories;
  const fatPct     = fatCalories / totalCalories;

  return (
    carbsPct   >= 0.45 && carbsPct   <= 0.65 &&
    proteinPct >= 0.10 && proteinPct <= 0.35 &&
    fatPct     >= 0.20 && fatPct     <= 0.35
  );
}

function inferCategory(
  food: FoodNutrition
): MealRecommendation['category'] {
  if (food.protein >= 20) return 'high_protein';
  if (food.carbs <= 40) return 'low_carb';
  if (food.calories <= 300) return 'quick_snack';
  if(isBalanced(food)) return 'balanced';
  if (food.protein >= 15 && food.calories <= 400) return 'post_workout';

  return 'balanced';
}

// step 0: build the candidate list from real food data
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
    seen.add(food.name);

    result.push({
      id: food.name.toLowerCase().replace(/\s+/g, '-'),
      name: food.name,
      description: `${food.calories} kcal · ${food.protein}g prot · ${food.carbs}g carbs · ${food.fat}g fat per ${food.servingSize}${food.servingUnit}`,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      category: inferCategory(food),
      whyItFits: 'Ajuda a complementar seus objetivos de macronutrientes.',
      prepTimeMinutes: 5,
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

//function to prepare data - create context for the model
// IMPORTANT:
// the context must use the candidate meals, not the meals already consumed in the day
function makeContext(dailyNutrition: DailyNutritionSummary, candidates: MealRecommendation[]) {
  const totalCalories = candidates.map(meal => meal.calories);
  const totalProtein = candidates.map(meal => meal.protein);
  const totalCarbs = candidates.map(meal => meal.carbs);
  const totalFat = candidates.map(meal => meal.fat);

  const minCalories = Math.min(...totalCalories);
  const minProtein = Math.min(...totalProtein);
  const minCarbs = Math.min(...totalCarbs);
  const minFat = Math.min(...totalFat);
  
  const maxCalories = Math.max(...totalCalories);
  const maxProtein = Math.max(...totalProtein);
  const maxCarbs = Math.max(...totalCarbs);
  const maxFat = Math.max(...totalFat);

  const categories = [...new Set(candidates.map(meal => meal.category))];

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

// step 2: create a tensor and normalized it
// normalize the input data to be between 0 and 1
const normalize = (value: number, min: number, max: number) =>
  (value - min) / ((max - min) || 1);


// step 2: encode the candidate meal
// this is the equivalent of encodeProduct in the ecommerce example
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
  const category = oneHotWeighted(
    context.categoryIndex[meal.category],
    context.numCategories,
    WEIGHTS.mealType
  ).as1D();

  return tf.concat1d([calories, protein, carbs, fat, category]);
}

// step 2.1: encode daily nutrition
// this is the equivalent of the "user vector" in the ecommerce example
// here we use the remaining values, because the recommendation must know what is still missing
function encodeDailyNutrition(dailyNutrition: DailyNutritionSummary) {
  const calories = tf.tensor1d([
    dailyNutrition.calories.remaining / dailyNutrition.calories.target,
  ]).mul(WEIGHTS.totalCalories).as1D();

  const protein = tf.tensor1d([
    dailyNutrition.protein.remaining / dailyNutrition.protein.target,
  ]).mul(WEIGHTS.totalProtein).as1D();

  const carbs = tf.tensor1d([
    dailyNutrition.carbs.remaining / dailyNutrition.carbs.target,
  ]).mul(WEIGHTS.totalCarbs).as1D();

  const fat = tf.tensor1d([
    dailyNutrition.fat.remaining / dailyNutrition.fat.target,
  ]).mul(WEIGHTS.totalFat).as1D();

  return tf.concat1d([calories, protein, carbs, fat]);
}

// optional helper
// this is only for debugging and intuition, not strictly required
function encodeMeal(meal: Meal, context: ReturnType<typeof makeContext>) {
  const calories = tf.tensor1d([
    normalize(meal.totalCalories, context.minCalories, context.maxCalories),
  ]).mul(WEIGHTS.totalCalories).as1D();

  const protein = tf.tensor1d([
    normalize(meal.totalProtein, context.minProtein, context.maxProtein),
  ]).mul(WEIGHTS.totalProtein).as1D();

  const carbs = tf.tensor1d([
    normalize(meal.totalCarbs, context.minCarbs, context.maxCarbs),
  ]).mul(WEIGHTS.totalCarbs).as1D();

  const fat = tf.tensor1d([
    normalize(meal.totalFat, context.minFat, context.maxFat),
  ]).mul(WEIGHTS.totalFat).as1D();

  return tf.concat1d([calories, protein, carbs, fat]);
}

// step 3: create a function to prepare data for training
// IMPORTANT:
// the training example must be daily state + candidate meal
function createTrainingData(
  dailyNutrition: DailyNutritionSummary,
  candidates: MealRecommendation[],
  context: ReturnType<typeof makeContext>
) {
  const input: number[][] = [];
  const labels: number[] = [];

  const dailyVector = Array.from(encodeDailyNutrition(dailyNutrition).dataSync());

  candidates.forEach((candidate) => {
    const candidateVector = Array.from(
      encodeRecommendationMeal(candidate, context).dataSync()
    );

    // FIX: stricter heuristic to create real contrast in the labels
    // before: almost everything was label=1, causing acc=1.00 from epoch 1
    const calRatio = candidate.calories / (dailyNutrition.calories.remaining || 1);
    const protRatio = candidate.protein / (dailyNutrition.protein.remaining || 1);

    // Label 1 only if the meal covers between 20% and 80% of the remaining deficit
    // And if protein is within a reasonable range
    const helpsCalories = calRatio >= 0.1 && calRatio <= 0.8;
    const helpsProtein = protRatio >= 0.1 && protRatio <= 1.0;
    const doesntExceedFat =
      candidate.fat <= dailyNutrition.fat.remaining + 5;

    const label = helpsCalories && helpsProtein && doesntExceedFat ? 1 : 0;

    input.push([...dailyVector, ...candidateVector]);
    labels.push(label);
  });

  // Check that there is at least one sample from each class; otherwise the model learns nothing
  const hasPositive = labels.some((l) => l === 1);
  const hasNegative = labels.some((l) => l === 0);
  if (!hasPositive || !hasNegative) {
    console.warn(
      '[Recommendations] Training data has only one class — labels:',
      labels
    );
  }

  return {
    xs: tf.tensor2d(input),
    ys: tf.tensor2d(labels, [labels.length, 1]),
    inputDimensions: dailyVector.length + context.dimensions,
  };
}

async function configureNeuralNetworkAndTrain(
  trainData: ReturnType<typeof createTrainingData>
) {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [trainData.inputDimensions],
      units: 32,
      activation: 'relu',
    })
  );
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  await model.fit(trainData.xs, trainData.ys, {
    epochs: 50,
    batchSize: 8,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss = ${logs?.loss}, accuracy = ${logs?.acc ?? logs?.accuracy}`
        );
      },
    },
  });

  return model;
}

// step E: use the trained model to score each candidate and build the response
function scoreAndRankCandidates(
  model: tf.Sequential,
  candidates: MealRecommendation[],
  context: ReturnType<typeof makeContext>,
  dailyNutrition: DailyNutritionSummary,
  topN = 5
): MealRecommendation[] {
  const dailyVector = Array.from(encodeDailyNutrition(dailyNutrition).dataSync());

  const scored = candidates.map((candidate) => {
    const candidateVector = Array.from(
      encodeRecommendationMeal(candidate, context).dataSync()
    );

    const inputTensor = tf.tensor2d([[...dailyVector, ...candidateVector]]);
    const scoreTensor = model.predict(inputTensor) as tf.Tensor;
    const score = scoreTensor.dataSync()[0];

    // Dispose tensors immediately to prevent memory leaks
    inputTensor.dispose();
    scoreTensor.dispose();

    // Build a dynamic whyItFits message based on what the meal complements
    const whyItFits = buildWhyItFits(candidate, dailyNutrition);

    return { candidate: { ...candidate, whyItFits }, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ candidate }) => candidate);
}

function buildWhyItFits(
  candidate: MealRecommendation,
  dailyNutrition: DailyNutritionSummary
): string {
  const reasons: string[] = [];

  const protFill = (candidate.protein / dailyNutrition.protein.remaining) * 100;
  const calFill = (candidate.calories / dailyNutrition.calories.remaining) * 100;

  if (protFill >= 20 && protFill <= 80)
    reasons.push(`cobre ~${Math.round(protFill)}% da proteína restante`);
  if (calFill >= 15 && calFill <= 70)
    reasons.push(`cobre ~${Math.round(calFill)}% das calorias restantes`);
  if (candidate.fat <= dailyNutrition.fat.remaining)
    reasons.push('dentro do limite de gordura do dia');

  return reasons.length > 0
    ? reasons.join(', ') + '.'
    : 'Ajuda a complementar seus objetivos de macronutrientes.';
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

  // step E: infer scores and return the ranked top N
  const recommendations = scoreAndRankCandidates(
    _model,
    candidates,
    context,
    dailyNutrition,
    5
  );

  console.log(
    '[Recommendations] Top recommendations:',
    recommendations.map((r) => `${r.name} (${r.whyItFits})`)
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