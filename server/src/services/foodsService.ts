import { FoodNutrition, OpenFoodFactsResponse } from '../types/food';
import { mockFoods } from '../data/mockFoods';
import axios from 'axios';

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export async function searchFood(query: string): Promise<FoodNutrition> {
  // create a request to the Open Food Facts API
  try{
    const response = await axios.get<OpenFoodFactsResponse>(OPEN_FOOD_FACTS_URL, {
      params:{
        search_terms: query,
        search_simple: 1,
        action: 'process',
        countries_tags: 'en:brazil',
        json: 1,
        page_size: 1
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'FitAI/1.0 muridelvaux@gmail.com',
      },
    });

    console.log(`[OpenFoodFacts] Total products found for "${query}":`, response.data.products?.length ?? 0);

    const products = response.data.products;

    if (!products || products.length === 0) {
      console.warn(`[OpenFoodFacts] Empty products array for "${query}", using mock fallback`);
      return mockFoods[query.toLowerCase()] ?? mockFoods['default'];
    }

    const validProduct = products.find(
      (product) =>
        product.product_name &&
        product.nutriments &&
        product.nutriments['energy-kcal_100g'] !== undefined
    );

    if (!validProduct) {
      // Log todos os produtos recebidos para debugar
      console.warn(
        `[OpenFoodFacts] No valid product for "${query}". Products received:`,
        products.map((p) => ({
          name: p.product_name,
          hasNutriments: !!p.nutriments,
          kcal: p.nutriments?.['energy-kcal_100g'],
        }))
      );
      // Fallback em vez de throw — o app não quebra
      return mockFoods[query.toLowerCase()] ?? mockFoods['default'];
    }

    const { product_name, nutriments } = validProduct;

    console.log(`[OpenFoodFacts] Found valid product: "${product_name}"`, nutriments);

    return {
      name: product_name,
      calories: Math.round(nutriments['energy-kcal_100g'] ?? 0),
      protein: Math.round(nutriments['proteins_100g'] ?? 0),
      carbs: Math.round(nutriments['carbohydrates_100g'] ?? 0),
      fat: Math.round(nutriments['fat_100g'] ?? 0),
      servingSize: 100,
      servingUnit: 'g',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[OpenFoodFacts] Axios error for "${query}":`, {
        message: error.message,
        code: error.code,           // ex: ECONNABORTED = timeout
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error(`[OpenFoodFacts] Unknown error for "${query}":`, error);
    }

    // Fallback silencioso em vez de quebrar o endpoint
    return mockFoods[query.toLowerCase()] ?? mockFoods['default'];
  }
}

export async function listFoods(): Promise<FoodNutrition[]> {
  try {
    const response = await axios.get<OpenFoodFactsResponse>(OPEN_FOOD_FACTS_URL, {
      params: {
        action: 'process',
        json: 1,
        page: 1,
        page_size: 50,
        fields: 'product_name,nutriments',
        countries_tags: 'en:brazil',
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'FitAI/1.0 muridelvaux@gmail.com',
      },
    });

    const products = response.data.products ?? [];

    if (products.length === 0) {
      console.warn(`[OpenFoodFacts] Empty products array, using mock fallback`);
      return Object.values(mockFoods);
    }

    const validProducts = products.filter(
      (product) =>
        product.product_name &&
        product.nutriments &&
        product.nutriments['energy-kcal_100g'] !== undefined
    );

    if (validProducts.length === 0) {
      console.warn(
        `[OpenFoodFacts] No valid products. Products received:`,
        products.map((p) => ({
          name: p.product_name,
          hasNutriments: !!p.nutriments,
          kcal: p.nutriments?.['energy-kcal_100g'],
        }))
      );
      return Object.values(mockFoods);
    }

    console.log(`[OpenFoodFacts] Found ${validProducts.length} valid products`);

    return validProducts.map((product) => ({
      name: product.product_name,
      calories: Math.round(
        product.nutriments['energy-kcal_100g'] ?? 0
      ),
      protein: Math.round(
        product.nutriments['proteins_100g'] ?? 0
      ),
      carbs: Math.round(
        product.nutriments['carbohydrates_100g'] ?? 0
      ),
      fat: Math.round(
        product.nutriments['fat_100g'] ?? 0
      ),
      servingSize: 100,
      servingUnit: 'g',
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[OpenFoodFacts] Axios error:`, {
        message: error.message,
        code: error.code,           // ex: ECONNABORTED = timeout
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error(`[OpenFoodFacts] Unknown error:`, error);
    }

    return Object.values(mockFoods);
  }
}
