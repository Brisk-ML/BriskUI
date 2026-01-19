export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "archived" | "completed";
}

export type FeatureDataType = "str" | "int" | "float";

export interface Feature {
  id: string;
  name: string;
  type: FeatureDataType;
}

export type DatasetFileType = "csv" | "parquet" | "json" | "xlsx";

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  tableName: string;
  fileType: DatasetFileType;
  groupColumn: string;
  targetFeature: string;
  featuresCount: number;
  observationsCount: number;
  features: Feature[];
  selected?: boolean;
}


export type SplitMethod = "random" | "shuffle" | "stratified";

export interface DataManagerConfig {
  testSize: {
    train: number;
    test: number;
  };
  groupColumn: string;
  splitMethod: SplitMethod;
  numberOfSplits: number;
  stratified: boolean;
  randomState: number;
}


export type PreprocessorType =
  | "missing-data"
  | "scaling"
  | "encoding"
  | "feature-selection";

export interface MissingDataConfig {
  strategy: "drop" | "impute";
  imputeMethod: "mean" | "median" | "mode" | "constant";
  constantValue?: string | number;
}

export interface ScalingConfig {
  method: "standard" | "minmax" | "robust" | "normalizer";
}

export interface EncodingConfig {
  method: "onehot" | "label" | "ordinal" | "binary";
  cutoffs?: string;
}

export interface FeatureSelectionConfig {
  method: "variance" | "univariate" | "recursive" | "lasso";
  numberOfFeatures?: number;
  estimator?: "random-forest" | "logistic" | "svm";
  crossValidation?: number;
}

export interface PreprocessorConfig {
  missingData?: MissingDataConfig;
  scaling?: ScalingConfig;
  encoding?: EncodingConfig;
  featureSelection?: FeatureSelectionConfig;
}

export interface SplitConfig {
  method: "random" | "stratified" | "time-based";
  trainRatio: number;
  validRatio: number;
  testRatio: number;
  randomSeed?: number;
}

export type AlgorithmHyperparameterValue = string | number | boolean | null;

export interface Algorithm {
  id: string;
  name: string;
  type: "classification" | "regression" | "clustering";
  category: "builtin" | "custom";
  description: string;
  hyperparameters?: Record<string, AlgorithmHyperparameterValue>;
}

export interface ProjectStats {
  experiments: number;
  groups: number;
  datasets: number;
  algorithms: number;
  metrics: number;
}

export interface ActivityItem {
  id: string;
  type: "create" | "update" | "delete" | "run";
  resource: string;
  description: string;
  timestamp: string;
}

export interface WizardData {
  projectName: string;
  projectDescription: string;
  projectObjective?: string;
  selectedDatasetIds: string[];
  dataManager?: DataManagerConfig;
  preprocessing?: PreprocessorConfig;
  selectedAlgorithmIds: string[];
  experiments?: ExperimentGroup[];
  workflow?: WorkflowConfig;
  report?: ReportConfig;
  sync?: SyncConfig;
}


export interface ExperimentGroup {
  id: string;
  name: string;
  datasetIds: string[];
  algorithmIds: string[];
  metrics: string[];
}


export interface WorkflowStep {
  id: string;
  type: "data" | "preprocess" | "model" | "evaluate";
  name: string;
  config?: Record<string, unknown>;
}

export interface WorkflowConfig {
  steps: WorkflowStep[];
  connections: Array<{ from: string; to: string }>;
}


export interface ReportConfig {
  plots: PlotConfig[];
  colorScheme?: string;
}

export interface PlotConfig {
  id: string;
  type: "line" | "bar" | "scatter" | "heatmap" | "boxplot";
  title: string;
  metrics: string[];
}


export interface SyncConfig {
  destination: "local" | "cloud" | "api";
  format: "json" | "csv" | "parquet";
  schedule?: "manual" | "auto";
}
