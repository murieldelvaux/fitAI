export interface ParsedFoodItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface ParsedMealResponse {
  parsedItems: ParsedFoodItem[];
  rawInput: string;
  detectedMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'supper';
}

export interface ParseMealRequest {
  input: string;
}
