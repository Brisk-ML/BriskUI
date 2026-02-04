export type FileType =
  | "text"
  | "code"
  | "data"
  | "image"
  | "document"
  | "archive"
  | "other";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  size: number;
  path: string;
  modifiedAt: string;
  createdAt: string;
  isFolder: boolean;
  parentId: string | null;
  children?: FileNode[];
  mimeType: string;
  extension: string;
  metadata?: {
    encoding?: string;
    lineCount?: number;
    checksum?: string;
  };
}

export interface FileUploadRequest {
  files: File[];
  targetFolder?: string;
}

export interface FileUploadResponse {
  files: FileNode[];
  errors?: {
    filename: string;
    error: string;
  }[];
}

export interface FileFilter {
  type?: FileType;
  searchQuery?: string;
  minSize?: number;
  maxSize?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface FilePreviewData {
  content: string | ArrayBuffer;
  metadata: {
    lines?: number;
    size: number;
    type: FileType;
    encoding?: string;
  };
}
