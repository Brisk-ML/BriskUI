/**
 * Workflow evaluator catalog: maps to Brisk Workflow methods and builtin evaluators.
 * Filter by problemType before showing cards; order added = order called in workflow.
 * Data args use workflow param names: X_train, X_test, y_train, y_test.
 * Single model assumed in variable "model" (generated as self.model).
 */

export type WorkflowProblemType = "both" | "classification" | "regression";

export type ArgFieldType = "data" | "data_x" | "data_y" | "metrics" | "metric_single" | "filename" | "number" | "select" | "boolean" | "text";

export interface WorkflowArgField {
  name: string;
  label: string;
  type: ArgFieldType;
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface WorkflowEvaluatorDef {
  id: string;
  name: string;
  problemType: WorkflowProblemType;
  methodName: string;
  /** Whether the Workflow method uses .plot() vs .evaluate() - for display only; backend knows. */
  callType: "evaluate" | "plot";
  /** Form fields for this evaluator. */
  argFields: WorkflowArgField[];
}

const DATA_OPTIONS = [
  { value: "train", label: "Train" },
  { value: "test", label: "Test" },
];

/** Brisk regression metrics for evaluate_model / evaluate_model_cv (names & abbreviations). */
export const REGRESSION_METRICS_OPTIONS = [
  { value: "MAE", label: "MAE" },
  { value: "MSE", label: "MSE" },
  { value: "RMSE", label: "RMSE" },
  { value: "R2", label: "R²" },
  { value: "MAPE", label: "MAPE" },
  { value: "CCC", label: "CCC" },
  { value: "AdjR2", label: "Adj R²" },
  { value: "NegMAE", label: "Neg MAE" },
  { value: "explained_variance_score", label: "Explained Variance" },
  { value: "max_error", label: "Max Error" },
  { value: "mean_pinball_loss", label: "Mean Pinball Loss" },
  { value: "mean_squared_log_error", label: "Mean Squared Log Error" },
  { value: "median_absolute_error", label: "Median Absolute Error" },
  { value: "root_mean_squared_log_error", label: "Root Mean Squared Log Error" },
];

/** Brisk classification metrics for evaluate_model / evaluate_model_cv (names & abbreviations). */
export const CLASSIFICATION_METRICS_OPTIONS = [
  { value: "accuracy", label: "Accuracy" },
  { value: "precision", label: "Precision" },
  { value: "recall", label: "Recall" },
  { value: "f1_score", label: "F1 Score" },
  { value: "balanced_accuracy", label: "Balanced Accuracy" },
  { value: "top_k_accuracy", label: "Top-k Accuracy" },
  { value: "log_loss", label: "Log Loss" },
  { value: "roc_auc", label: "ROC AUC" },
  { value: "brier", label: "Brier Score" },
];

/** The fixed first step: must always be present and cannot be moved/deleted. */
export const FIT_MODEL_EVALUATOR: WorkflowEvaluatorDef = {
  id: "fit_model",
  name: "Fit Model",
  problemType: "both",
  methodName: "fit_model",
  callType: "evaluate",
  argFields: [
    { name: "data", label: "Data", type: "data", default: "train", options: DATA_OPTIONS },
  ],
};

export const WORKFLOW_EVALUATORS: WorkflowEvaluatorDef[] = [
  // --- Common (both) ---
  {
    id: "evaluate_model",
    name: "Evaluate Model",
    problemType: "both",
    methodName: "evaluate_model",
    callType: "evaluate",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "metrics", label: "Metrics", type: "metrics" },
      { name: "filename", label: "Filename", type: "filename", default: "evaluate_model", placeholder: "evaluate_model" },
    ],
  },
  {
    id: "evaluate_model_cv",
    name: "Evaluate Model CV",
    problemType: "both",
    methodName: "evaluate_model_cv",
    callType: "evaluate",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "train", options: DATA_OPTIONS },
      { name: "metrics", label: "Metrics", type: "metrics" },
      { name: "filename", label: "Filename", type: "filename", default: "evaluate_model_cv", placeholder: "evaluate_model_cv" },
      { name: "cv", label: "CV folds", type: "number", default: 5, placeholder: "5" },
    ],
  },
  {
    id: "plot_learning_curve",
    name: "Plot Learning Curve",
    problemType: "both",
    methodName: "plot_learning_curve",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "train", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "learning_curve", placeholder: "learning_curve" },
      { name: "cv", label: "CV folds", type: "number", default: 5, placeholder: "5" },
      { name: "num_repeats", label: "Num repeats", type: "number", default: 1, placeholder: "1" },
      { name: "n_jobs", label: "n_jobs", type: "number", default: -1, placeholder: "-1" },
      { name: "metric", label: "Metric", type: "metric_single", default: "neg_mean_absolute_error" },
    ],
  },
  {
    id: "plot_feature_importance",
    name: "Plot Feature Importance",
    problemType: "both",
    methodName: "plot_feature_importance",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "train", options: DATA_OPTIONS },
      { name: "threshold", label: "Threshold (top N or min value)", type: "number", default: 10, placeholder: "10" },
      { name: "filename", label: "Filename", type: "filename", default: "feature_importance", placeholder: "feature_importance" },
      { name: "metric", label: "Metric", type: "metric_single", default: "neg_mean_absolute_error" },
      { name: "num_rep", label: "Num repetitions", type: "number", default: 5, placeholder: "5" },
    ],
  },
  {
    id: "hyperparameter_tuning",
    name: "Hyperparameter Tuning",
    problemType: "both",
    methodName: "hyperparameter_tuning",
    callType: "evaluate",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "train", options: DATA_OPTIONS },
      { name: "method", label: "Method", type: "select", default: "grid", options: [{ value: "grid", label: "Grid" }, { value: "random", label: "Random" }] },
      { name: "scorer", label: "Scorer", type: "metric_single", default: "neg_mean_absolute_error" },
      { name: "kf", label: "CV folds", type: "number", default: 5, placeholder: "5" },
      { name: "num_rep", label: "Num repeats", type: "number", default: 3, placeholder: "3" },
      { name: "n_jobs", label: "n_jobs", type: "number", default: -1, placeholder: "-1" },
      { name: "plot_results", label: "Plot results", type: "boolean", default: false },
    ],
  },
  {
    id: "plot_shapley_values",
    name: "Plot SHAPley Values",
    problemType: "both",
    methodName: "plot_shapley_values",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "shapley_values", placeholder: "shapley_values" },
      { name: "plot_type", label: "Plot type", type: "select", default: "bar", options: [
        { value: "bar", label: "Bar" },
        { value: "waterfall", label: "Waterfall" },
        { value: "violin", label: "Violin" },
        { value: "beeswarm", label: "Beeswarm" },
      ] },
    ],
  },
  {
    id: "save_model",
    name: "Save Model",
    problemType: "both",
    methodName: "save_model",
    callType: "evaluate",
    argFields: [
      { name: "filename", label: "Filename", type: "filename", default: "model", placeholder: "model" },
    ],
  },
  // --- Regression only ---
  {
    id: "plot_pred_vs_obs",
    name: "Plot Predicted vs Observed",
    problemType: "regression",
    methodName: "plot_pred_vs_obs",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "pred_vs_obs", placeholder: "pred_vs_obs" },
    ],
  },
  {
    id: "plot_residuals",
    name: "Plot Residuals",
    problemType: "regression",
    methodName: "plot_residuals",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "residuals", placeholder: "residuals" },
      { name: "add_fit_line", label: "Add fit line", type: "boolean", default: false },
    ],
  },
  // --- Classification only ---
  {
    id: "confusion_matrix",
    name: "Confusion Matrix",
    problemType: "classification",
    methodName: "confusion_matrix",
    callType: "evaluate",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "confusion_matrix", placeholder: "confusion_matrix" },
    ],
  },
  {
    id: "plot_confusion_heatmap",
    name: "Plot Confusion Heatmap",
    problemType: "classification",
    methodName: "plot_confusion_heatmap",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "confusion_heatmap", placeholder: "confusion_heatmap" },
    ],
  },
  {
    id: "plot_roc_curve",
    name: "Plot ROC Curve",
    problemType: "classification",
    methodName: "plot_roc_curve",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "roc_curve", placeholder: "roc_curve" },
      { name: "pos_label", label: "Positive label", type: "number", default: 1, placeholder: "1" },
    ],
  },
  {
    id: "plot_precision_recall_curve",
    name: "Plot Precision-Recall Curve",
    problemType: "classification",
    methodName: "plot_precision_recall_curve",
    callType: "plot",
    argFields: [
      { name: "data", label: "Data", type: "data", default: "test", options: DATA_OPTIONS },
      { name: "filename", label: "Filename", type: "filename", default: "precision_recall_curve", placeholder: "precision_recall_curve" },
      { name: "pos_label", label: "Positive label", type: "number", default: 1, placeholder: "1" },
    ],
  },
];

export type ProblemTypeFilter = "classification" | "regression";

/** Filter evaluators by problem type for the wizard. */
export function getWorkflowEvaluatorsForProblemType(problemType: ProblemTypeFilter): WorkflowEvaluatorDef[] {
  return WORKFLOW_EVALUATORS.filter(
    (e) => e.problemType === problemType || e.problemType === "both"
  );
}
