/**
 * Project settings API endpoints.
 */

import { apiClient } from "./client";

export type ProblemType = "classification" | "regression";

export interface ProjectSettings {
  project_name: string;
  project_path: string;
  project_description: string;
  project_type: ProblemType;
}

export interface ProjectSettingsUpdate {
  project_name?: string;
  project_path?: string;
  project_description?: string;
  project_type?: ProblemType;
}

export interface CreateProjectRequest {
  project_name: string;
  project_path?: string;
  project_description?: string;
  project_type?: ProblemType;
}

export interface CreateProjectResponse {
  project_name: string;
  project_path: string;
  project_description: string;
  project_type: ProblemType;
  directory_name: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  deleted_path: string;
}

export interface ProjectStats {
  groups: number;
  experiments: number;
  datasets: number;
  algorithms: number;
  workflow_steps: number;
}

export interface DataManagerConfig {
  test_size: number;
  n_splits: number;
  split_method: "shuffle" | "kfold";
  group_column: string | null;
  stratified: boolean;
  random_state: number | null;
}

export interface WriteDataFileRequest {
  base_data_manager: DataManagerConfig;
}

export interface WriteDataFileResponse {
  success: boolean;
  file_path: string;
}

export interface AlgorithmWrapperConfig {
  name: string;
  display_name: string;
  class_name: string;
  class_module: string;
  default_params: Record<string, string | number | boolean | null>;
  search_space: Record<string, (string | number | boolean)[]>;
  use_defaults: boolean;
}

export interface WriteAlgorithmsFileRequest {
  wrappers: AlgorithmWrapperConfig[];
}

export interface WriteAlgorithmsFileResponse {
  success: boolean;
  file_path: string;
}

export interface WriteMetricsFileRequest {
  problem_type: "classification" | "regression";
}

export interface WriteMetricsFileResponse {
  success: boolean;
  file_path: string;
}

export interface WriteEvaluatorsFileResponse {
  success: boolean;
  file_path: string;
}

/** Single preprocessor entry for data_config.preprocessors */
export interface PreprocessorEntry {
  type: "missing-data" | "scaling" | "encoding" | "feature-selection";
  config: Record<string, unknown>;
}

export interface ExperimentGroupDataConfig {
  test_size?: number;
  n_splits?: number;
  split_method?: "shuffle" | "kfold";
  group_column?: string | null;
  stratified?: boolean;
  random_state?: number | null;
  preprocessors?: PreprocessorEntry[];
}

export interface ExperimentGroupConfig {
  name: string;
  description?: string;
  dataset_file_name: string;
  dataset_table_name?: string | null;
  algorithms: string[];
  use_default_data_manager: boolean;
  data_config?: ExperimentGroupDataConfig;
}

/** PlotSettings payload: only non-default values are written to settings.py. */
export interface PlotSettingsPayload {
  file_format?: string;
  transparent?: boolean;
  width?: number;
  height?: number;
  dpi?: number;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

export interface CategoricalFeaturesEntry {
  dataset_file_name: string;
  table_name?: string | null;
  features: string[];
}

export interface WriteSettingsFileRequest {
  problem_type: "classification" | "regression";
  default_algorithms: string[];
  experiment_groups: ExperimentGroupConfig[];
  /** Optional categorical features mapping per dataset. */
  categorical_features?: CategoricalFeaturesEntry[];
  /** Optional; only non-default keys are written as PlotSettings(...). */
  plot_settings?: PlotSettingsPayload;
}

export interface WriteSettingsFileResponse {
  success: boolean;
  file_path: string;
}

export interface WorkflowStepConfig {
  evaluator_id: string;
  method_name: string;
  args: Record<string, unknown>;
}

export interface WriteWorkflowFileRequest {
  problem_type: "classification" | "regression";
  steps: WorkflowStepConfig[];
}

export interface WriteWorkflowFileResponse {
  success: boolean;
  file_path: string;
}

/**
 * Get project settings from backend.
 */
export async function getProjectSettings(): Promise<ProjectSettings> {
  return apiClient.get<ProjectSettings>("/project");
}

/**
 * Create or initialize project settings.
 * Creates .brisk directory and project.json file.
 * In create mode, creates a new directory named after the project.
 */
export async function createProject(
  data: CreateProjectRequest
): Promise<CreateProjectResponse> {
  return apiClient.post<CreateProjectResponse>("/project", data);
}

/**
 * Update project settings.
 * Only provided fields will be updated.
 */
export async function updateProjectSettings(
  update: ProjectSettingsUpdate
): Promise<ProjectSettings> {
  return apiClient.patch<ProjectSettings>("/project", update);
}

/**
 * Delete the entire project directory.
 * WARNING: This is destructive and cannot be undone.
 */
export async function deleteProject(): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>("/project");
}

export interface MoveProjectRequest {
  new_path: string;
  new_description?: string;  // Optionally update description during move
}

export interface MoveProjectResponse {
  success: boolean;
  old_path: string;
  new_path: string;
  message: string;
}

/**
 * Move the project directory to a new location.
 * After this operation, the backend needs to be restarted with the new path.
 */
export async function moveProject(data: MoveProjectRequest): Promise<MoveProjectResponse> {
  return apiClient.post<MoveProjectResponse>("/project/move", data);
}

/**
 * Write the data.py file with BASE_DATA_MANAGER configuration.
 */
export async function writeDataFile(
  data: WriteDataFileRequest
): Promise<WriteDataFileResponse> {
  return apiClient.post<WriteDataFileResponse>("/project/data-file", data);
}

/**
 * Write the algorithms.py file with ALGORITHM_CONFIG.
 */
export async function writeAlgorithmsFile(
  data: WriteAlgorithmsFileRequest
): Promise<WriteAlgorithmsFileResponse> {
  return apiClient.post<WriteAlgorithmsFileResponse>("/project/algorithms-file", data);
}

/**
 * Write the metrics.py file based on problem type.
 */
export async function writeMetricsFile(
  data: WriteMetricsFileRequest
): Promise<WriteMetricsFileResponse> {
  return apiClient.post<WriteMetricsFileResponse>("/project/metrics-file", data);
}

/**
 * Write the evaluators.py template file.
 */
export async function writeEvaluatorsFile(): Promise<WriteEvaluatorsFileResponse> {
  return apiClient.post<WriteEvaluatorsFileResponse>("/project/evaluators-file", {});
}

/**
 * Write the settings.py file with Configuration and experiment groups.
 */
export async function writeSettingsFile(
  data: WriteSettingsFileRequest
): Promise<WriteSettingsFileResponse> {
  return apiClient.post<WriteSettingsFileResponse>("/project/settings-file", data);
}

/**
 * Write the workflow file to workflows/<problem_type>.py.
 */
export async function writeWorkflowFile(
  data: WriteWorkflowFileRequest
): Promise<WriteWorkflowFileResponse> {
  return apiClient.post<WriteWorkflowFileResponse>("/project/workflow-file", data);
}

// ============================================================================
// Preview Files API
// ============================================================================

export interface PreviewFilesRequest {
  data_file?: WriteDataFileRequest;
  algorithms_file?: WriteAlgorithmsFileRequest;
  metrics_file?: WriteMetricsFileRequest;
  settings_file?: WriteSettingsFileRequest;
  workflow_file?: WriteWorkflowFileRequest;
}

export interface PreviewFilesResponse {
  files: Record<string, string>;
}

/**
 * Generate file contents without writing to disk (preview).
 */
export async function previewFiles(
  data: PreviewFilesRequest
): Promise<PreviewFilesResponse> {
  return apiClient.post<PreviewFilesResponse>("/project/preview-files", data);
}

// ============================================================================
// Workflow Data API
// ============================================================================

export interface WorkflowStepInfo {
  evaluator_id: string;
  method_name: string;
  args: Record<string, unknown>;
}

export interface WorkflowDataResponse {
  steps: WorkflowStepInfo[];
  problem_type: ProblemType;
}

/**
 * Get workflow steps from the current workflow file.
 */
export async function getWorkflowData(): Promise<WorkflowDataResponse> {
  return apiClient.get<WorkflowDataResponse>("/project/workflow-data");
}

// ============================================================================
// Plot Settings API
// ============================================================================

export interface PlotSettingsData {
  file_format: string;
  transparent: boolean;
  width: number;
  height: number;
  dpi: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

/**
 * Get plot settings from settings.py file.
 */
export async function getPlotSettings(): Promise<PlotSettingsData> {
  return apiClient.get<PlotSettingsData>("/project/plot-settings");
}

/**
 * Get project statistics (groups, experiments, datasets, algorithms, metrics).
 */
export async function getProjectStats(): Promise<ProjectStats> {
  return apiClient.get<ProjectStats>("/project/stats");
}

// ============================================================================
// File Preview API
// ============================================================================

export interface ProjectFileInfo {
  id: string;
  name: string;
  path: string;
  exists: boolean;
  size: number;
}

export interface ProjectFilesResponse {
  files: ProjectFileInfo[];
  project_type: ProblemType;
}

export interface FileContentResponse {
  name: string;
  content: string;
  exists: boolean;
}

/**
 * Get list of project configuration files.
 */
export async function getProjectFiles(): Promise<ProjectFilesResponse> {
  return apiClient.get<ProjectFilesResponse>("/project/files");
}

/**
 * Get the content of a specific project file.
 */
export async function getFileContent(fileId: string): Promise<FileContentResponse> {
  return apiClient.get<FileContentResponse>(`/project/files/${encodeURIComponent(fileId)}/content`);
}

/**
 * Download a project file.
 */
export async function downloadFile(fileId: string): Promise<Blob> {
  const API_BASE = import.meta.env.DEV
    ? "http://localhost:8050/api"
    : "/api";
  
  const response = await fetch(`${API_BASE}/project/files/${encodeURIComponent(fileId)}/download`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return response.blob();
}

// ============================================================================
// Experiments Data API
// ============================================================================

export interface DatasetInfo {
  name: string;
  filename: string;
  file_type: string;
}

export interface AlgorithmInfo {
  name: string;
  display_name: string;
  class_name: string;
  class_module: string;
  default_params: Record<string, unknown>;
  use_defaults: boolean;
}

export interface ExperimentGroupInfo {
  name: string;
  description: string;
  datasets: string[];
  algorithms: string[];
}

export interface ExperimentsDataResponse {
  datasets: DatasetInfo[];
  algorithms: AlgorithmInfo[];
  experiment_groups: ExperimentGroupInfo[];
}

/**
 * Get all data needed for the experiments page.
 */
export async function getExperimentsData(): Promise<ExperimentsDataResponse> {
  return apiClient.get<ExperimentsDataResponse>("/project/experiments-data");
}

// ============================================================================
// Dataset File Parsing API
// ============================================================================

export interface FeatureInfo {
  name: string;
  data_type: "str" | "int" | "float";
  categorical: boolean;
}

export interface ParsedDatasetInfo {
  file_name: string;
  file_type: "csv" | "xlsx";
  features: FeatureInfo[];
  target_feature: string;
  feature_count: number;
  row_count: number;
}

/**
 * Parse a dataset file and return metadata without loading full file into memory.
 * Supports CSV and XLSX files.
 */
export async function parseDatasetFile(file: File): Promise<ParsedDatasetInfo> {
  const API_BASE = import.meta.env.DEV
    ? "http://localhost:8050/api"
    : "/api";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/project/parse-dataset-file`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to parse file" }));
    throw new Error(errorData.detail || "Failed to parse file");
  }

  return response.json();
}

// ============================================================================
// Dataset Configuration Storage API
// ============================================================================

export interface StoredFeatureInfo {
  name: string;
  data_type: "str" | "int" | "float";
  categorical: boolean;
}

export interface StoredDataManagerConfig {
  test_size?: number;
  n_splits?: number;
  split_method?: "shuffle" | "kfold";
  group_column?: string | null;
  stratified?: boolean;
  random_state?: number | null;
}

export interface StoredPreprocessorConfig {
  type: "missing-data" | "scaling" | "encoding" | "feature-selection";
  config: Record<string, unknown>;
}

export interface StoredDatasetConfig {
  id: string;  // filename or "filename:tablename" for sqlite
  file_name: string;
  table_name?: string | null;
  file_type: "csv" | "xlsx" | "sqlite";
  target_feature: string;
  features_count: number;
  observations_count: number;
  features: StoredFeatureInfo[];
  data_manager?: StoredDataManagerConfig | null;
  preprocessors: StoredPreprocessorConfig[];
}

export interface StoredDatasetsResponse {
  datasets: StoredDatasetConfig[];
}

export interface SaveDatasetsRequest {
  datasets: StoredDatasetConfig[];
}

export interface SaveDatasetsResponse {
  success: boolean;
  saved_count: number;
}

/**
 * Get datasets merged from file system and stored configuration.
 * Uses consistent IDs based on file names.
 */
export async function getStoredDatasets(): Promise<StoredDatasetsResponse> {
  return apiClient.get<StoredDatasetsResponse>("/project/datasets");
}

/**
 * Save datasets configuration to project.json.
 */
export async function saveDatasets(data: SaveDatasetsRequest): Promise<SaveDatasetsResponse> {
  return apiClient.patch<SaveDatasetsResponse>("/project/datasets", data);
}
