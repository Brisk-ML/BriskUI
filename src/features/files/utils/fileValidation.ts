import type { FileType } from "../types";

export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  MAX_FILES_PER_UPLOAD: 20,
  ALLOWED_TYPES: [
    "text/*",
    "image/*",
    "application/json",
    "application/pdf",
    ".csv",
    ".xlsx",
    ".xls",
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
  ],
} as const;

export interface ValidationError {
  file: File;
  error: "size" | "type" | "count";
  message: string;
}

export function validateFiles(files: File[]): {
  valid: File[];
  errors: ValidationError[];
} {
  const valid: File[] = [];
  const errors: ValidationError[] = [];

  if (files.length > FILE_CONSTRAINTS.MAX_FILES_PER_UPLOAD) {
    return {
      valid: [],
      errors: files.map((file) => ({
        file,
        error: "count",
        message: `Maximum ${FILE_CONSTRAINTS.MAX_FILES_PER_UPLOAD} files allowed`,
      })),
    };
  }

  files.forEach((file) => {
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
      errors.push({
        file,
        error: "size",
        message: `File exceeds ${FILE_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      });
      return;
    }

    const isAllowed = FILE_CONSTRAINTS.ALLOWED_TYPES.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type);
      }
      return file.type.startsWith(type.replace("/*", ""));
    });

    if (!isAllowed) {
      errors.push({
        file,
        error: "type",
        message: "File type not allowed",
      });
      return;
    }

    valid.push(file);
  });

  return { valid, errors };
}

export function canPreview(file: { type: FileType }): boolean {
  const previewableTypes: FileType[] = ["text", "code", "data", "image"];
  return previewableTypes.includes(file.type);
}
