import * as tf from '@tensorflow/tfjs-node';
import { MealRecommendation, RecommendationsResponse } from '../types/recommendation';
import { DailyNutritionSummary, MacroGoals } from '../types/nutrition';
import { Meal } from '../types/meal';
import { DEFAULT_GOALS, getDailyNutrition } from './nutritionService';
import { FoodNutrition } from '../types/food';
import { listFoods } from './foodsService';

// create weigths for the model
const WEIGHTS = {  
  totalCalories: 0.4,
  totalProtein: 0.3,
  totalCarbs: 0.2,
  totalFat: 0.1,
  mealType: 0.1,
}

function inferCategory(
  food: FoodNutrition
): MealRecommendation['category'] {
  if (food.protein >= 20) return 'high_protein';
  if (food.carbs <= 40) return 'low_carb';
  if (food.calories <= 300) return 'quick_snack';

  return 'balanced';
}

// step 0: build the candidate list from real food data
async function getCandidateFoods(): Promise<MealRecommendation[]> {
  const foods = await listFoods();

  // Deduplica por nome (mesmo comportamento que antes com mockFoods)
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

// step 3: create a function to adequar data to train
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

  candidates.forEach(candidate => {
    const candidateVector = Array.from(
      encodeRecommendationMeal(candidate, context).dataSync()
    );

    // simple heuristic label for the first version:
    // label 1 when the meal helps the remaining deficit without greatly exceeding it
    const helpsCalories = candidate.calories <= dailyNutrition.calories.remaining + 150;
    const helpsProtein = candidate.protein <= dailyNutrition.protein.remaining + 20;
    const helpsCarbs = candidate.carbs <= dailyNutrition.carbs.remaining + 20;
    const helpsFat = candidate.fat <= dailyNutrition.fat.remaining + 10;

    // protein gets priority because this app has a strong fitness / macro focus
    const label =
      (helpsProtein && helpsCalories) || (helpsProtein && helpsCarbs && helpsFat)
        ? 1
        : 0;

    input.push([...dailyVector, ...candidateVector]);
    labels.push(label);
  });

  return {
    xs: tf.tensor2d(input),
    ys: tf.tensor2d(labels, [labels.length, 1]),
    inputDimensions: dailyVector.length + context.dimensions,
  };
}

// step 4: configure the neural network and train
async function configureNeuralNetworkAndTrain(
  trainData: ReturnType<typeof createTrainingData>
) {
  // normalized data and we will add layers of neural network and train model
  const model = tf.sequential();

  // first hidden layer learns broader patterns
  model.add(
    tf.layers.dense({
      inputShape: [trainData.inputDimensions],
      units: 32,
      activation: 'relu',
    })
  );

  // second hidden layer compresses the information
  model.add(
    tf.layers.dense({
      units: 16,
      activation: 'relu',
    })
  );

  // compress final result in interval betweeen 0 and 1
  model.add(
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    })
  );

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

export async function getRecommendations(
  dateStr?: string,
  customGoals: MacroGoals = DEFAULT_GOALS
): Promise<RecommendationsResponse> {
  debugger;
  return trainModel(dateStr, customGoals);
}

export async function trainModel(
  dateStr?: string,
  customGoals: MacroGoals = DEFAULT_GOALS
): Promise<RecommendationsResponse> {
  debugger;

  // step A: get the current daily state
  const dailyNutrition = await getDailyNutrition(dateStr, customGoals);

  // step B: create context based on the recommendation catalog
    const candidates = await getCandidateFoods();

  const context = makeContext(dailyNutrition, candidates);
  _globalCtx = context;


  // step C: create training data
  const trainingData = createTrainingData(
    dailyNutrition,
    candidates,
    context
  );

  // step D: train the model
  _model = await configureNeuralNetworkAndTrain(trainingData);

  console.log('training model with context:', context);
  console.log('tensor meal (debug only)', encodeMeal(dailyNutrition.meals[0], context).dataSync());
  console.log('tensor daily nutrition', encodeDailyNutrition(dailyNutrition).dataSync());

  // step E: predict recommendation scores

  throw new Error('Recommendation pipeline not implemented yet');
}