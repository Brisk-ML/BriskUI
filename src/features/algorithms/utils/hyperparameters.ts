import { ALGORITHMS_CATALOG } from "../constants/algorithmsCatalog";
import type {
  AlgorithmCatalogItem,
  HyperparameterField,
  HyperparameterValue,
  HyperparameterValues,
} from "../types";

/**
 * Get algorithm from catalog by ID
 */
export function getAlgorithmById(
  algorithmId: string,
): AlgorithmCatalogItem | undefined {
  return ALGORITHMS_CATALOG.find((alg) => alg.id === algorithmId);
}

/**
 * Get default hyperparameter values for an algorithm
 */
export function getDefaultHyperparameters(
  algorithmId: string,
): HyperparameterValues {
  const algorithm = getAlgorithmById(algorithmId);
  if (!algorithm) return {};

  const defaults: HyperparameterValues = {};
  for (const field of algorithm.hyperparameters) {
    defaults[field.name] = field.defaultValue;
  }
  return defaults;
}

/**
 * Validate hyperparameter values
 */
export function validateHyperparameters(
  algorithmId: string,
  values: HyperparameterValues,
): { valid: boolean; errors: Record<string, string> } {
  const algorithm = getAlgorithmById(algorithmId);
  if (!algorithm) {
    return { valid: false, errors: { _general: "Algorithm not found" } };
  }

  const errors: Record<string, string> = {};

  for (const field of algorithm.hyperparameters) {
    const value = values[field.name];

    // Check required fields
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    // Type validation
    if (value !== undefined && value !== null && value !== "") {
      if (field.type === "number") {
        const numValue = Number(value);
        if (Number.isNaN(numValue)) {
          errors[field.name] = `${field.label} must be a valid number`;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format hyperparameter value for display
 */
export function formatHyperparameterValue(
  field: HyperparameterField,
  value: HyperparameterValue,
): string {
  if (value === null || value === undefined) {
    return "None";
  }

  if (field.type === "boolean" || field.type === "select") {
    return String(value);
  }

  if (field.type === "number") {
    return String(value);
  }

  return String(value);
}
