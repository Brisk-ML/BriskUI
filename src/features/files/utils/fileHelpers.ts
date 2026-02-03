import {
  Archive,
  Code,
  File,
  FileJson,
  FileSpreadsheet,
  FileText,
  Folder,
  Image,
} from "lucide-react";
import type { FileNode, FileType } from "../types";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / k ** i).toFixed(1)} ${units[i]}`;
}

export function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext) return "other";

  const typeMap: Record<string, FileType> = {
    txt: "text",
    md: "text",
    rst: "text",
    py: "code",
    js: "code",
    ts: "code",
    jsx: "code",
    tsx: "code",
    java: "code",
    cpp: "code",
    c: "code",
    go: "code",
    rs: "code",
    html: "code",
    css: "code",
    scss: "code",
    vue: "code",
    csv: "data",
    json: "data",
    xml: "data",
    xlsx: "data",
    xls: "data",
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    svg: "image",
    webp: "image",
    bmp: "image",
    pdf: "document",
    docx: "document",
    doc: "document",
    zip: "archive",
    tar: "archive",
    gz: "archive",
    rar: "archive",
  };

  return typeMap[ext] || "other";
}

export function getFileIcon(file: FileNode) {
  if (file.isFolder) return Folder;

  switch (file.type) {
    case "text":
      return FileText;
    case "code":
      return Code;
    case "data":
      return file.extension === "json" ? FileJson : FileSpreadsheet;
    case "image":
      return Image;
    case "archive":
      return Archive;
    default:
      return File;
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Builds a tree structure from flat file list by linking children to parents
export function buildFileTree(files: FileNode[]): FileNode[] {
  const fileMap = new Map<string, FileNode>();
  const rootFiles: FileNode[] = [];

  // First pass: create all nodes with empty children arrays
  files.forEach((file) => {
    fileMap.set(file.id, { ...file, children: [] });
  });

  // Second pass: link children to their parents
  files.forEach((file) => {
    const node = fileMap.get(file.id);
    if (!node) return;

    if (file.parentId) {
      const parent = fileMap.get(file.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      rootFiles.push(node);
    }
  });

  return rootFiles;
}

// Sort files: folders first, then alphabetically
export function sortFiles(files: FileNode[]): FileNode[] {
  return [...files].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });
}
