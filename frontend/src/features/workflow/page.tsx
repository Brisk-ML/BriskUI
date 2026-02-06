import { ArrowRight, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getWorkflowData } from "@/api";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { STYLES } from "@/shared/constants/colors";
import {
  getWorkflowEvaluatorsForProblemType,
  REGRESSION_METRICS_OPTIONS,
  CLASSIFICATION_METRICS_OPTIONS,
  type WorkflowEvaluatorDef,
  type WorkflowArgField,
} from "@/features/project/constants/workflowEvaluators";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import {
  usePendingChangesStore,
  type WorkflowStepState,
} from "@/shared/stores/usePendingChangesStore";

function getDefaultArgValue(field: WorkflowArgField): unknown {
  if (field.default !== undefined) return field.default;
  if (field.type === "number") return 0;
  if (field.type === "boolean") return false;
  return "";
}

function buildInitialArgs(fields: WorkflowArgField[]): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  for (const f of fields) {
    args[f.name] = getDefaultArgValue(f);
  }
  return args;
}

/** Expand form "data" (train/test) to X and y for backend; strip "data" from args. */
function expandDataArgs(args: Record<string, unknown>): Record<string, unknown> {
  const out = { ...args };
  const data = out.data;
  if (data === "train" || data === "test") {
    out.X = data === "train" ? "X_train" : "X_test";
    out.y = data === "train" ? "y_train" : "y_test";
  }
  delete out.data;
  return out;
}

/** Convert backend X/y vars back to "train" or "test" for form display */
function collapseDataArgs(args: Record<string, unknown>): Record<string, unknown> {
  const out = { ...args };
  const X = out.X;
  if (X === "X_train") {
    out.data = "train";
  } else if (X === "X_test") {
    out.data = "test";
  }
  delete out.X;
  delete out.y;
  return out;
}

interface EvaluatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluator: WorkflowEvaluatorDef | null;
  problemType: "classification" | "regression";
  onSave: (args: Record<string, unknown>) => void;
  /** If editing, provide initial args */
  initialArgs?: Record<string, unknown>;
  /** Whether this is an edit vs add */
  isEditing?: boolean;
}

function EvaluatorModal({
  open,
  onOpenChange,
  evaluator,
  problemType,
  onSave,
  initialArgs,
  isEditing = false,
}: EvaluatorModalProps) {
  const [formArgs, setFormArgs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open && evaluator) {
      // If editing, use initialArgs (collapsed back to form format)
      if (isEditing && initialArgs) {
        const collapsed = collapseDataArgs(initialArgs);
        setFormArgs({ ...buildInitialArgs(evaluator.argFields), ...collapsed });
      } else {
        const initial = buildInitialArgs(evaluator.argFields);
        const metricsField = evaluator.argFields.find((f) => f.type === "metrics");
        if (metricsField) {
          const defaultMetrics =
            problemType === "classification"
              ? [CLASSIFICATION_METRICS_OPTIONS[0]?.value ?? "accuracy"]
              : [REGRESSION_METRICS_OPTIONS[0]?.value ?? "MAE"];
          initial[metricsField.name] = Array.isArray(initial[metricsField.name])
            ? initial[metricsField.name]
            : defaultMetrics;
        }
        setFormArgs(initial);
      }
    }
  }, [open, evaluator, problemType, isEditing, initialArgs]);

  const resetForm = () => {
    if (evaluator) {
      setFormArgs(buildInitialArgs(evaluator.argFields));
    }
  };

  const updateArg = (name: string, value: unknown) => {
    setFormArgs((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSaveClick = () => {
    if (!evaluator) return;
    const expanded = expandDataArgs(formArgs);
    onSave(expanded);
    handleOpenChange(false);
  };

  const dialogOpen = open && !!evaluator;
  const currentArgs = useMemo(() => {
    if (!evaluator) return {};
    const initial = buildInitialArgs(evaluator.argFields);
    return { ...initial, ...formArgs };
  }, [evaluator, formArgs]);

  const metricsOptions =
    problemType === "classification"
      ? CLASSIFICATION_METRICS_OPTIONS
      : REGRESSION_METRICS_OPTIONS;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {evaluator && (
        <DialogContent
          className={`${STYLES.bgCard} border-2 ${STYLES.border} text-white max-w-[95vw] sm:max-w-[520px] p-4 sm:p-6`}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="mb-2 sm:mb-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-display">
              {isEditing ? "Edit" : "Add"} {evaluator.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
            {evaluator.argFields.map((field) => (
              <div key={field.name} className={field.type === "boolean" || field.type === "metrics" ? "sm:col-span-2" : ""}>
                <Label className="text-white text-sm sm:text-base font-display mb-2 block">
                  {field.label}
                </Label>
                {field.type === "data" ? (
                  <Select
                    value={String(currentArgs[field.name] ?? field.default ?? "")}
                    onValueChange={(v) => updateArg(field.name, v)}
                  >
                    <SelectTrigger
                      className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                    >
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent className={`${STYLES.bgCardAlt} ${STYLES.border}`}>
                      {(field.options ?? []).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "metrics" ? (
                  <div className="flex flex-wrap gap-2 p-2 rounded border border-[#404040] bg-[#181818] max-h-[140px] overflow-y-auto">
                    {metricsOptions.map((opt) => {
                      const selected = (currentArgs[field.name] as string[] | undefined) ?? [];
                      const checked = selected.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 cursor-pointer text-sm text-white/90"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => {
                              const next = c
                                ? [...selected, opt.value]
                                : selected.filter((v) => v !== opt.value);
                              const fallback = metricsOptions[0]?.value ?? "";
                              updateArg(field.name, next.length ? next : (fallback ? [fallback] : []));
                            }}
                            className={`${STYLES.border} ${STYLES.dataCheckedBgPrimaryLight} ${STYLES.dataCheckedBorderPrimaryLight}`}
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                ) : field.type === "metric_single" ? (
                  <Select
                    value={String(currentArgs[field.name] ?? field.default ?? "")}
                    onValueChange={(v) => updateArg(field.name, v)}
                  >
                    <SelectTrigger
                      className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                    >
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent className={`${STYLES.bgCardAlt} ${STYLES.border}`}>
                      {metricsOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "data_x" || field.type === "data_y" || (field.type === "select" && field.options) ? (
                  <Select
                    value={String(currentArgs[field.name] ?? field.default ?? "")}
                    onValueChange={(v) => updateArg(field.name, v)}
                  >
                    <SelectTrigger
                      className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                    >
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent className={`${STYLES.bgCardAlt} ${STYLES.border}`}>
                      {(field.options ?? []).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`workflow-${field.name}`}
                      checked={Boolean(currentArgs[field.name])}
                      onCheckedChange={(checked) => updateArg(field.name, !!checked)}
                      className={`${STYLES.border} ${STYLES.dataCheckedBgPrimaryLight} ${STYLES.dataCheckedBorderPrimaryLight}`}
                    />
                    <label htmlFor={`workflow-${field.name}`} className="text-white/80 text-sm font-display">
                      {field.label}
                    </label>
                  </div>
                ) : field.type === "number" ? (
                  <Input
                    type="number"
                    value={
                      currentArgs[field.name] !== undefined && currentArgs[field.name] !== null
                        ? String(currentArgs[field.name])
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      const num = v === "" ? undefined : Number(v);
                      updateArg(field.name, num);
                    }}
                    placeholder={field.placeholder}
                    className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                  />
                ) : (
                  <Input
                    value={String(currentArgs[field.name] ?? "")}
                    onChange={(e) => updateArg(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handleSaveClick}
              className={`btn-add-hover ${STYLES.bgPrimary} text-white h-10 sm:h-11 md:h-12 px-6 text-base sm:text-lg font-display`}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default function WorkflowPage() {
  const { projectType } = useProjectStore();
  const {
    workflowSteps,
    setWorkflowSteps,
    addWorkflowStep,
    removeWorkflowStep,
    moveWorkflowStep,
  } = usePendingChangesStore();

  const [isLoading, setIsLoading] = useState(true);

  const evaluators = useMemo(
    () => getWorkflowEvaluatorsForProblemType(projectType),
    [projectType]
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] =
    useState<WorkflowEvaluatorDef | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStepState | null>(null);

  // Load existing workflow on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      setIsLoading(true);
      try {
        const response = await getWorkflowData();
        
        // Convert backend steps to frontend state
        const loadedSteps: WorkflowStepState[] = response.steps.map((step, index) => ({
          id: `step-loaded-${index}-${Date.now()}`,
          evaluatorId: step.evaluator_id,
          methodName: step.method_name,
          args: step.args,
        }));
        
        setWorkflowSteps(loadedSteps);
        
        // Reset hasChanges after loading
        usePendingChangesStore.setState({ hasChanges: false });
      } catch (error) {
        console.error("Failed to load workflow:", error);
      }
      setIsLoading(false);
    };
    loadWorkflow();
  }, [setWorkflowSteps]);

  const handleCardClick = (evaluator: WorkflowEvaluatorDef) => {
    setEditingStep(null);
    setSelectedEvaluator(evaluator);
    setShowModal(true);
  };

  const handleEditStep = (step: WorkflowStepState) => {
    const evaluator = evaluators.find((e) => e.id === step.evaluatorId);
    if (evaluator) {
      setEditingStep(step);
      setSelectedEvaluator(evaluator);
      setShowModal(true);
    }
  };

  const handleSaveStep = (args: Record<string, unknown>) => {
    if (!selectedEvaluator) return;
    
    if (editingStep) {
      // Update existing step - remove old and add new with same position
      const stepIndex = workflowSteps.findIndex((s) => s.id === editingStep.id);
      if (stepIndex >= 0) {
        // Remove old step
        removeWorkflowStep(editingStep.id);
        // Add new step (it will be added at the end, but we need to reorder)
        const newId = `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newSteps = [...workflowSteps.filter((s) => s.id !== editingStep.id)];
        newSteps.splice(stepIndex, 0, {
          id: newId,
          evaluatorId: selectedEvaluator.id,
          methodName: selectedEvaluator.methodName,
          args,
        });
        setWorkflowSteps(newSteps);
        usePendingChangesStore.setState({ hasChanges: true });
      }
    } else {
      // Add new step
      addWorkflowStep({
        evaluatorId: selectedEvaluator.id,
        methodName: selectedEvaluator.methodName,
        args,
      });
    }
    setSelectedEvaluator(null);
    setEditingStep(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}>
        <p className="text-white/60 font-display text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-4 sm:gap-6">
          {/* Evaluator cards - filtered by problem type */}
          <div>
            <h2 className="h1-underline text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display mb-4">
              Add Evaluator Steps ({projectType})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {evaluators.map((evaluator) => (
                <button
                  key={evaluator.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCardClick(evaluator);
                  }}
                  className={cn(
                    "card-hover-fade border-2 border-[#404040] bg-[#181818] hover:bg-[#282828] transition-colors duration-300 relative",
                    "p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-1",
                    "min-h-[70px] sm:min-h-[80px]",
                  )}
                >
                  <span className="text-white text-sm sm:text-base lg:text-[18px] font-display leading-tight">
                    {evaluator.name}
                  </span>
                  <span className="text-white/50 text-xs font-display">
                    {evaluator.callType === "plot" ? "Plot" : "Evaluate"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow pipeline (order = execution order) */}
          <div className={`${STYLES.bgDark} border-2 ${STYLES.borderSecondary} p-4 sm:p-6 min-h-[280px]`}>
            <h2 className="h1-underline text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display mb-4 sm:mb-6">
              Workflow Pipeline
            </h2>

            {workflowSteps.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-white/60 text-lg sm:text-xl font-display">
                  Click an evaluator above to add it to the workflow. Order added =
                  order executed.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                {workflowSteps.map((step, index) => (
                  <Fragment key={step.id}>
                    <StepCard
                      step={step}
                      evaluators={evaluators}
                      onRemove={() => removeWorkflowStep(step.id)}
                      onEdit={() => handleEditStep(step)}
                      onMoveLeft={index > 0 ? () => moveWorkflowStep(step.id, "up") : undefined}
                      onMoveRight={
                        index < workflowSteps.length - 1
                          ? () => moveWorkflowStep(step.id, "down")
                          : undefined
                      }
                    />
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 flex-shrink-0" />
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EvaluatorModal
        open={showModal}
        onOpenChange={setShowModal}
        evaluator={selectedEvaluator}
        problemType={projectType}
        onSave={handleSaveStep}
        initialArgs={editingStep?.args}
        isEditing={!!editingStep}
      />
    </div>
  );
}

function StepCard({
  step,
  evaluators,
  onRemove,
  onEdit,
  onMoveLeft,
  onMoveRight,
}: {
  step: WorkflowStepState;
  evaluators: WorkflowEvaluatorDef[];
  onRemove: () => void;
  onEdit: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}) {
  const def = evaluators.find((e) => e.id === step.evaluatorId);
  const displayName = def?.name ?? step.methodName;
  const filename = step.args.filename != null ? String(step.args.filename) : null;

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "card-hover-fade relative border-2 border-[#404040] bg-[#282828] hover:bg-[#303030] transition-colors cursor-pointer",
        "p-4 sm:p-5 w-[180px] sm:w-[200px] min-h-[100px] sm:min-h-[120px]",
        "flex flex-col text-left",
      )}
    >
      {/* Delete button */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            onRemove();
          }
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="text-white text-base sm:text-lg font-display font-bold pr-6">
          {displayName}
        </div>
        {filename && (
          <div className="text-white/50 text-sm font-display truncate">
            {filename}
          </div>
        )}
      </div>

      {/* Move arrows in bottom corners */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
        {onMoveLeft ? (
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onMoveLeft();
              }
            }}
            className="p-1 rounded hover:bg-[#1175d5]/20 transition-colors group"
            title="Move left"
          >
            <img 
              src="/caret-left.svg" 
              alt="Move left" 
              className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity [filter:brightness(1)] group-hover:[filter:brightness(1)_invert(40%)_sepia(90%)_saturate(1000%)_hue-rotate(190deg)]"
            />
          </div>
        ) : (
          <div className="w-7" />
        )}
        {onMoveRight ? (
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onMoveRight();
              }
            }}
            className="p-1 rounded hover:bg-[#1175d5]/20 transition-colors group"
            title="Move right"
          >
            <img 
              src="/caret-right.svg" 
              alt="Move right" 
              className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity [filter:brightness(1)] group-hover:[filter:brightness(1)_invert(40%)_sepia(90%)_saturate(1000%)_hue-rotate(190deg)]"
            />
          </div>
        ) : (
          <div className="w-7" />
        )}
      </div>
    </button>
  );
}
