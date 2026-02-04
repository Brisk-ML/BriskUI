/**
 * Project settings API endpoints.
 */

import { apiClient } from "./client";

export interface ProjectSettings {
  project_name: string;
  project_path: string;
  project_description: string;
}

export interface ProjectSettingsUpdate {
  project_name?: string;
  project_path?: string;
  project_description?: string;
}

/**
 * Get project settings from backend.
 */
export async function getProjectSettings(): Promise<ProjectSettings> {
  return apiClient.get<ProjectSettings>("/project");
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
