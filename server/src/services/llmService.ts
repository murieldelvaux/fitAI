import { ParsedMealResponse } from '../types/llm';

// TODO: Implement LLM integration
// This service should call your preferred LLM provider (e.g., OpenAI, Gemini)
// to parse natural language meal descriptions into structured food items.
// Expected input: string (raw user input)
// Expected output: ParsedMealResponse (see llmSchema.ts)
export async function parseMeal(input: string): Promise<ParsedMealResponse> {
  // TODO: Replace with actual LLM API call

  const normalized = input.toLowerCase().trim();

  // Smart heuristic parser to make any natural language inputs work dynamically in mock mode
  const detectedItems: { name: string; quantity: number; unit: string }[] = [];

  // Match pattern: "200g de frango" or "200 g chicken" or "2 eggs" or "1 tbsp olive oil"
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(g|gr|gramas|grams|kg|ml|oz|tbsp|colher|scoop|unidade|unidades|fatia|fatias|medium|large|small|xícara|cup)?\s*(?:de|of)?\s*([a-zA-Záéíóúâêîôûãõç\s]+)/gi,
  ];

  // Specific keyword recognition
  const foodKeywords: Record<string, string> = {
    'frango grelhado': 'grilled chicken',
    'frango': 'grilled chicken',
    'chicken': 'grilled chicken',
    'batata doce': 'sweet potato',
    'sweet potato': 'sweet potato',
    'azeite': 'olive oil',
    'olive oil': 'olive oil',
    'salmao': 'salmon',
    'salmão': 'salmon',
    'salmon': 'salmon',
    'ovo': 'eggs',
    'ovos': 'eggs',
    'egg': 'eggs',
    'eggs': 'eggs',
    'arroz integral': 'brown rice',
    'arroz branco': 'white rice',
    'arroz': 'white rice',
    'rice': 'white rice',
    'aveia': 'oats',
    'oats': 'oats',
    'oatmeal': 'oats',
    'banana': 'banana',
    'whey': 'whey protein',
    'whey protein': 'whey protein',
    'iogurte': 'greek yogurt',
    'iogurte grego': 'greek yogurt',
    'greek yogurt': 'greek yogurt',
    'abacate': 'avocado',
    'avocado': 'avocado',
    'pasta de amendoim': 'peanut butter',
    'peanut butter': 'peanut butter',
    'brocolis': 'broccoli',
    'brócolis': 'broccoli',
    'broccoli': 'broccoli',
    'pao integral': 'whole wheat bread',
    'pão integral': 'whole wheat bread',
    'pao': 'whole wheat bread',
    'bread': 'whole wheat bread',
    'carne': 'lean beef',
    'beef': 'lean beef',
  };

  // Check if input contains prompt default example
  if (normalized.includes('frango') && normalized.includes('batata doce')) {
    return {
      parsedItems: [
        { name: 'grilled chicken', quantity: 200, unit: 'g' },
        { name: 'sweet potato', quantity: 150, unit: 'g' },
        { name: 'olive oil', quantity: 10, unit: 'ml' },
      ],
      rawInput: input,
      detectedMealType: 'lunch',
    };
  }

  // General heuristic extraction
  for (const [key, mappedName] of Object.entries(foodKeywords)) {
    if (normalized.includes(key)) {
      // Find quantity before or after
      const regex = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(g|gr|ml|tbsp|colher|scoop|unidade|unidades|fatia|fatias|medium)?\\s*(?:de)?\\s*${key}`, 'i');
      const match = normalized.match(regex);
      
      let quantity = 100;
      let unit = 'g';

      if (match) {
        quantity = parseFloat(match[1].replace(',', '.'));
        unit = match[2] || 'g';
      } else {
        if (['egg', 'eggs', 'ovo', 'ovos', 'banana', 'apple'].includes(mappedName)) {
          quantity = 1;
          unit = 'unit';
        } else if (['olive oil', 'azeite'].includes(mappedName)) {
          quantity = 15;
          unit = 'ml';
        } else if (['whey protein'].includes(mappedName)) {
          quantity = 1;
          unit = 'scoop';
        }
      }

      if (!detectedItems.some(item => item.name === mappedName)) {
        detectedItems.push({
          name: mappedName,
          quantity,
          unit,
        });
      }
    }
  }

  // If nothing was detected, return default mock items
  if (detectedItems.length === 0) {
    return {
      parsedItems: [
        { name: 'grilled chicken', quantity: 200, unit: 'g' },
        { name: 'sweet potato', quantity: 1, unit: 'medium' },
      ],
      rawInput: input,
      detectedMealType: 'lunch',
    };
  }

  return {
    parsedItems: detectedItems,
    rawInput: input,
    detectedMealType: normalized.includes('cafe') || normalized.includes('café') || normalized.includes('breakfast')
      ? 'breakfast'
      : normalized.includes('almoco') || normalized.includes('almoço') || normalized.includes('lunch')
      ? 'lunch'
      : normalized.includes('ceia') || normalized.includes('supper')
      ? 'supper'
      : normalized.includes('jantar') || normalized.includes('dinner')
      ? 'dinner'
      : normalized.includes('lanche') || normalized.includes('snack')
      ? 'snack'
      : 'lunch',
  };
}
