/**
 * Server status API.
 */

import { apiClient } from "./client";

export interface ServerStatus {
  project_path: string;
  create_mode: boolean;
  project_initialized: boolean;
  database_exists: boolean;
}

export interface ValidatePathResponse {
  path: string;
  exists: boolean;
  is_directory: boolean;
}

export interface SwitchModeResponse {
  success: boolean;
  project_path: string;
  create_mode: boolean;
}

/**
 * Get server status and mode information.
 */
export async function getServerStatus(): Promise<ServerStatus> {
  return apiClient.get<ServerStatus>("/status");
}

/**
 * Validate a filesystem path exists and is a directory.
 */
export async function validatePath(path: string): Promise<ValidatePathResponse> {
  return apiClient.get<ValidatePathResponse>(`/validate-path?path=${encodeURIComponent(path)}`);
}

/**
 * Switch the backend from create mode to edit mode with a new project path.
 */
export async function switchToEditMode(projectPath: string): Promise<SwitchModeResponse> {
  return apiClient.post<SwitchModeResponse>(`/switch-to-edit-mode?project_path=${encodeURIComponent(projectPath)}`, {});
}
