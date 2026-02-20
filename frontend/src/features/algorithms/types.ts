// Algorithm Wrapper types for configured algorithm instances

// Hyperparameter value can be string, number, boolean, or null
export type HyperparameterValue = string | number | boolean | null;

// Record of hyperparameter name to single value (for default_params)
export type HyperparameterValues = Record<string, HyperparameterValue>;

// Array of values for hyperparameter search space
export type HyperparameterArrayValue = (string | number | boolean)[];

// Record of hyperparameter name to array of values (for search space)
export type HyperparameterSearchSpace = Record<string, HyperparameterArrayValue>;

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
  useDefaults: boolean; // Whether using catalog defaults for default_params
  defaultParams: HyperparameterValues; // Default parameter values (single values)
  searchSpace: HyperparameterSearchSpace; // Search space for hyperparameter tuning (arrays)
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
