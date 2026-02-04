/**
 * Test API endpoints for frontend-backend integration testing.
 */

import { apiClient } from "./client";

export interface TransformRequest {
  text: string;
}

export interface TransformResponse {
  original: string;
  letters: string[];
}

/**
 * Transform input text by splitting into uppercase letters.
 * Used for testing frontend-backend integration.
 */
export async function transformText(
  text: string
): Promise<TransformResponse> {
  return apiClient.post<TransformResponse>("/test/transform", { text });
}
