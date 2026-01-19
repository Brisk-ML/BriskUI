import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FileFilter,
  FileNode,
  FilePreviewData,
  FileUploadRequest,
  FileUploadResponse,
} from "../types";
import { getFileType, sortFiles } from "../utils/fileHelpers";
import { validateFiles } from "../utils/fileValidation";

interface FileStoreState {
  files: FileNode[];
  selectedFileId: string | null;
  previewData: FilePreviewData | null;
  filter: FileFilter;
  isLoading: boolean;
  isSyncing: boolean;
  isUploading: boolean;
  error: string | null;
  selectedFile: FileNode | null;
  filteredFiles: FileNode[];
  loadFiles: () => Promise<void>;
  selectFile: (id: string | null) => void;
  uploadFiles: (request: FileUploadRequest) => Promise<FileUploadResponse>;
  deleteFile: (id: string) => Promise<void>;
  syncFiles: () => Promise<void>;
  loadPreview: (fileId: string) => Promise<void>;
  clearPreview: () => void;
  setFilter: (filter: Partial<FileFilter>) => void;
  clearFilter: () => void;
  clearError: () => void;
  reset: () => void;
}

// Mock data - 5 Python files from Figma design
const MOCK_FILES: FileNode[] = [
  {
    id: "1",
    name: "settings.py",
    type: "code",
    size: 2458,
    path: "/settings.py",
    modifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isFolder: false,
    parentId: null,
    mimeType: "text/x-python",
    extension: "py",
    metadata: {
      encoding: "utf-8",
      lineCount: 87,
    },
  },
  {
    id: "2",
    name: "algorithms.py",
    type: "code",
    size: 8294,
    path: "/algorithms.py",
    modifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    isFolder: false,
    parentId: null,
    mimeType: "text/x-python",
    extension: "py",
    metadata: {
      encoding: "utf-8",
      lineCount: 234,
    },
  },
  {
    id: "3",
    name: "metrics.py",
    type: "code",
    size: 3788,
    path: "/metrics.py",
    modifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isFolder: false,
    parentId: null,
    mimeType: "text/x-python",
    extension: "py",
    metadata: {
      encoding: "utf-8",
      lineCount: 156,
    },
  },
  {
    id: "4",
    name: "data.py",
    type: "code",
    size: 5324,
    path: "/data.py",
    modifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    isFolder: false,
    parentId: null,
    mimeType: "text/x-python",
    extension: "py",
    metadata: {
      encoding: "utf-8",
      lineCount: 189,
    },
  },
  {
    id: "5",
    name: "workflow.py",
    type: "code",
    size: 6963,
    path: "/workflow.py",
    modifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    isFolder: false,
    parentId: null,
    mimeType: "text/x-python",
    extension: "py",
    metadata: {
      encoding: "utf-8",
      lineCount: 201,
    },
  },
];

// Mock preview content
const MOCK_PREVIEW_CONTENT: Record<string, string> = {
  "1": `# settings.py
# Application configuration settings

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Database configuration
DATABASE = {
    'ENGINE': 'postgresql',
    'NAME': 'brisk_db',
    'USER': os.environ.get('DB_USER', 'admin'),
    'PASSWORD': os.environ.get('DB_PASSWORD'),
    'HOST': os.environ.get('DB_HOST', 'localhost'),
    'PORT': os.environ.get('DB_PORT', '5432'),
}

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}`,
  "2": `# algorithms.py
# Machine learning algorithms implementation

import numpy as np
from sklearn.base import BaseEstimator
from typing import List, Dict, Any

class CustomAlgorithm(BaseEstimator):
    """Custom ML algorithm for data processing."""

    def __init__(self, learning_rate: float = 0.01, max_iter: int = 1000):
        self.learning_rate = learning_rate
        self.max_iter = max_iter
        self.weights = None

    def fit(self, X: np.ndarray, y: np.ndarray):
        """Train the model."""
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)

        for _ in range(self.max_iter):
            predictions = self._predict(X)
            gradient = np.dot(X.T, (predictions - y)) / n_samples
            self.weights -= self.learning_rate * gradient

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions."""
        return self._predict(X)

    def _predict(self, X: np.ndarray) -> np.ndarray:
        linear_output = np.dot(X, self.weights)
        return self._sigmoid(linear_output)

    @staticmethod
    def _sigmoid(z: np.ndarray) -> np.ndarray:
        return 1 / (1 + np.exp(-z))`,
  "3": `# metrics.py
# Performance metrics and evaluation

from typing import List, Dict
import numpy as np

def calculate_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate classification accuracy."""
    return np.mean(y_true == y_pred)

def calculate_precision(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate precision score."""
    true_positives = np.sum((y_true == 1) & (y_pred == 1))
    predicted_positives = np.sum(y_pred == 1)
    return true_positives / predicted_positives if predicted_positives > 0 else 0.0

def calculate_recall(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate recall score."""
    true_positives = np.sum((y_true == 1) & (y_pred == 1))
    actual_positives = np.sum(y_true == 1)
    return true_positives / actual_positives if actual_positives > 0 else 0.0

def calculate_f1_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate F1 score."""
    precision = calculate_precision(y_true, y_pred)
    recall = calculate_recall(y_true, y_pred)
    return 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0`,
  "4": `# data.py
# Data processing and management

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Tuple

class DataProcessor:
    """Process and manage datasets."""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.data = None

    def load_data(self, filename: str) -> pd.DataFrame:
        """Load data from file."""
        filepath = self.data_dir / filename

        if filepath.suffix == '.csv':
            self.data = pd.read_csv(filepath)
        elif filepath.suffix in ['.xlsx', '.xls']:
            self.data = pd.read_excel(filepath)
        else:
            raise ValueError(f"Unsupported file format: {filepath.suffix}")

        return self.data

    def preprocess(self) -> pd.DataFrame:
        """Preprocess the loaded data."""
        if self.data is None:
            raise ValueError("No data loaded. Call load_data() first.")

        # Remove duplicates
        self.data = self.data.drop_duplicates()

        # Handle missing values
        self.data = self.data.fillna(self.data.mean(numeric_only=True))

        return self.data`,
  "5": `# workflow.py
# Workflow orchestration and execution

from typing import List, Dict, Any, Callable
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class Task:
    """Represents a workflow task."""
    name: str
    function: Callable
    dependencies: List[str]

class Workflow:
    """Orchestrate and execute workflows."""

    def __init__(self, name: str):
        self.name = name
        self.tasks: Dict[str, Task] = {}

    def add_task(self, task: Task) -> None:
        """Add a task to the workflow."""
        self.tasks[task.name] = task

    def execute(self) -> Dict[str, Any]:
        """Execute all tasks in dependency order."""
        results = {}
        executed = set()

        def execute_task(task_name: str):
            if task_name in executed:
                return

            task = self.tasks[task_name]

            # Execute dependencies first
            for dep in task.dependencies:
                execute_task(dep)

            logger.info(f"Executing task: {task_name}")
            results[task_name] = task.function()
            executed.add(task_name)

        for task_name in self.tasks:
            execute_task(task_name)

        return results`,
};

const initialState = {
  files: MOCK_FILES,
  selectedFileId: null,
  previewData: null,
  filter: {},
  isLoading: false,
  isSyncing: false,
  isUploading: false,
  error: null,
};

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Computed: find the currently selected file
      get selectedFile() {
        const { files, selectedFileId } = get();
        return files.find((f) => f.id === selectedFileId) || null;
      },

      // Computed: apply all active filters to the file list
      get filteredFiles() {
        const { files, filter } = get();
        let filtered = [...files];

        if (filter.type) {
          filtered = filtered.filter((f) => f.type === filter.type);
        }

        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          filtered = filtered.filter((f) =>
            f.name.toLowerCase().includes(query),
          );
        }

        if (filter.minSize !== undefined) {
          const minSize = filter.minSize;
          filtered = filtered.filter((f) => f.size >= minSize);
        }
        if (filter.maxSize !== undefined) {
          const maxSize = filter.maxSize;
          filtered = filtered.filter((f) => f.size <= maxSize);
        }

        if (filter.dateFrom) {
          const dateFrom = new Date(filter.dateFrom);
          filtered = filtered.filter(
            (f) => new Date(f.modifiedAt) >= dateFrom,
          );
        }
        if (filter.dateTo) {
          const dateTo = new Date(filter.dateTo);
          filtered = filtered.filter(
            (f) => new Date(f.modifiedAt) <= dateTo,
          );
        }

        return sortFiles(filtered);
      },

      loadFiles: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ files: MOCK_FILES, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load files",
            isLoading: false,
          });
        }
      },

      selectFile: (id) => {
        // Clear preview when selecting a new file, then load it if an ID is provided
        set({ selectedFileId: id, previewData: null });
        if (id) {
          get().loadPreview(id);
        }
      },

      uploadFiles: async (request: FileUploadRequest) => {
        set({ isUploading: true, error: null });
        try {
          const { valid, errors: validationErrors } = validateFiles(
            request.files,
          );

          if (validationErrors.length > 0) {
            const response: FileUploadResponse = {
              files: [],
              errors: validationErrors.map((e) => ({
                filename: e.file.name,
                error: e.message,
              })),
            };
            set({ isUploading: false });
            return response;
          }

          // Simulate upload
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Create file nodes
          const newFiles: FileNode[] = valid.map((file, index) => ({
            id: `file-${Date.now()}-${index}`,
            name: file.name,
            type: getFileType(file.name),
            size: file.size,
            path: `/${file.name}`,
            modifiedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            isFolder: false,
            parentId: request.targetFolder || null,
            mimeType: file.type || "application/octet-stream",
            extension: file.name.split(".").pop() || "",
          }));

          set((state) => ({
            files: [...state.files, ...newFiles],
            isUploading: false,
          }));

          return { files: newFiles };
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to upload files",
            isUploading: false,
          });
          throw error;
        }
      },

      deleteFile: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          set((state) => ({
            files: state.files.filter((f) => f.id !== id),
            selectedFileId:
              state.selectedFileId === id ? null : state.selectedFileId,
            previewData: state.selectedFileId === id ? null : state.previewData,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete file",
            isLoading: false,
          });
          throw error;
        }
      },

      syncFiles: async () => {
        set({ isSyncing: true, error: null });
        try {
          // Simulate sync operation
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // In real app: const files = await api.syncFiles();
          set({ files: MOCK_FILES, isSyncing: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to sync files",
            isSyncing: false,
          });
          throw error;
        }
      },

      // Actions - Preview
      loadPreview: async (fileId: string) => {
        const file = get().files.find((f) => f.id === fileId);
        if (!file) return;

        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const content =
            MOCK_PREVIEW_CONTENT[fileId] || "No preview available";

          set({
            previewData: {
              content,
              metadata: {
                lines: content.split("\n").length,
                size: file.size,
                type: file.type,
                encoding: file.metadata?.encoding,
              },
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load preview",
            isLoading: false,
          });
        }
      },

      clearPreview: () => {
        set({ previewData: null });
      },

      // Actions - Filter
      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      clearFilter: () => {
        set({ filter: {} });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "brisk-file-storage",
      partialize: (state) => ({ selectedFileId: state.selectedFileId }),
    },
  ),
);
