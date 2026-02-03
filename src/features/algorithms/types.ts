// Algorithm Wrapper types for configured algorithm instances

// Hyperparameter value can be string, number, boolean, or null
export type HyperparameterValue = string | number | boolean | null;

// Record of hyperparameter name to value
export type HyperparameterValues = Record<string, HyperparameterValue>;

// Option for select-type hyperparameter fields
export interface HyperparameterOption {
  label: string;
  value: HyperparameterValue;
}

export interface AlgorithmWrapper {
  id: string;
  algorithmId: string; // Reference to catalog algorithm
  name: string; // Short name (e.g., "ridge")
  displayName: string; // Display name (e.g., "Ridge Regression")
  className: string; // Python class name (e.g., "Ridge")
  useDefaults: boolean; // Toggle between defaults and custom hyperparameters
  hyperparameters: HyperparameterValues; // Custom hyperparameter values
  hasHyperparameterGrid: boolean; // Whether hyperparameter grid is configured
}

export interface HyperparameterField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  defaultValue: HyperparameterValue;
  options?: HyperparameterOption[]; // For select fields
  placeholder?: string;
  required?: boolean;
}

export interface AlgorithmCatalogItem {
  id: string;
  name: string; // Display name (e.g., "Ridge Regression")
  shortName: string; // Short name for internal use
  className: string; // Python class name
  type: "regression" | "classification" | "clustering";
  category: "builtin";
  description: string;
  hyperparameters: HyperparameterField[];
}
