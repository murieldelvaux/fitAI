import { api } from './api';
import { ParsedMealResponse, ParseMealRequest } from '../types/llm';

export async function parseMealWithLLM(input: string): Promise<ParsedMealResponse> {
  const payload: ParseMealRequest = { input };
  const response = await api.post<{ success: boolean; data: ParsedMealResponse }>('/llm/parse-meal', payload);
  return response.data.data;
}
