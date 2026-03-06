import { ArrowRight, GripVertical, X } from "lucide-react";
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
import { HoverSelect } from "@/shared/components/ui/hover-select";
import { STYLES } from "@/shared/constants/colors";
import {
  getWorkflowEvaluatorsForProblemType,
  REGRESSION_METRICS_OPTIONS,
  CLASSIFICATION_METRICS_OPTIONS,
  FIT_MODEL_EVALUATOR,
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
        for (const field of evaluator.argFields) {
          if (field.type === "metric_single") {
            initial[field.name] =
              problemType === "classification"
                ? CLASSIFICATION_METRICS_OPTIONS[0]?.value ?? "accuracy"
                : REGRESSION_METRICS_OPTIONS[0]?.value ?? "MAE";
          }
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
                  <HoverSelect
                    value={String(currentArgs[field.name] ?? field.default ?? "")}
                    onValueChange={(v) => updateArg(field.name, v)}
                    placeholder={field.placeholder}
                    options={(field.options ?? []).map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                    triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                  />
                ) : field.type === "metrics" ? (
                  <div className="flex flex-wrap gap-2 p-2 border border-[#404040] bg-[#181818] max-h-[140px] overflow-y-auto">
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
                  <HoverSelect
                    value={String(currentArgs[field.name] ?? field.default ?? "")}
                    onValueChange={(v) => updateArg(field.name, v)}
                    placeholder={field.placeholder}
                    options={metricsOptions.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                    triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                  />
                ) : field.type === "data_x" || field.type === "data_y" || (field.type === "select" && field.options) ? (
                  <HoverSelect
                    value={String(currentArgs[field.name] ?? field.default ?? "")}
                    onValueChange={(v) => updateArg(field.name, v)}
                    placeholder={field.placeholder}
                    options={(field.options ?? []).map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                    triggerClassName={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-9 sm:h-10 text-sm sm:text-base`}
                  />
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

          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => handleOpenChange(false)}
              className={`${STYLES.bgCardAlt} border ${STYLES.border} text-white h-10 sm:h-11 md:h-12 px-6 text-base sm:text-lg font-display hover:bg-[#303030] transition-colors`}
            >
              Cancel
            </Button>
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

const FIT_MODEL_STEP: WorkflowStepState = {
  id: "fit-model-fixed",
  evaluatorId: FIT_MODEL_EVALUATOR.id,
  methodName: FIT_MODEL_EVALUATOR.methodName,
  args: { X: "X_train", y: "y_train" },
};

function ensureFitModelFirst(steps: WorkflowStepState[]): WorkflowStepState[] {
  if (steps.length > 0 && steps[0].evaluatorId === "fit_model") return steps;
  return [FIT_MODEL_STEP, ...steps.filter((s) => s.evaluatorId !== "fit_model")];
}

export default function WorkflowPage() {
  const { projectType } = useProjectStore();
  const {
    workflowSteps,
    setWorkflowSteps,
    addWorkflowStep,
    removeWorkflowStep,
    markChanged,
    markSectionLoaded,
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragEnter = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    if (index === 0 || dragIndex === 0) return;
    const reordered = [...workflowSteps];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setWorkflowSteps(reordered);
    markChanged();
    setDragIndex(index);
  };

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
        
        setWorkflowSteps(ensureFitModelFirst(loadedSteps));
        
        markSectionLoaded("workflow");
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
    if (step.evaluatorId === "fit_model") return;
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
      const stepIndex = workflowSteps.findIndex((s) => s.id === editingStep.id);
      if (stepIndex >= 0) {
        removeWorkflowStep(editingStep.id);
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
      addWorkflowStep({
        evaluatorId: selectedEvaluator.id,
        methodName: selectedEvaluator.methodName,
        args,
      });
    }
    setSelectedEvaluator(null);
    setEditingStep(null);
  };

  const userSteps = workflowSteps.filter((s) => s.evaluatorId !== "fit_model");

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

            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              {workflowSteps.map((step, index) => (
                <Fragment key={step.id}>
                  <StepCard
                    step={step}
                    evaluators={evaluators}
                    locked={step.evaluatorId === "fit_model"}
                    onRemove={() => removeWorkflowStep(step.id)}
                    onEdit={() => handleEditStep(step)}
                    onDragStart={() => setDragIndex(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(e) => e.preventDefault()}
                    isDragging={dragIndex === index}
                  />
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 flex-shrink-0" />
                  )}
                </Fragment>
              ))}
            </div>

            {userSteps.length === 0 && (
              <p className="text-white/60 text-base font-display mt-4">
                Click an evaluator above to add steps after Fit Model.
              </p>
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
  locked = false,
  onRemove,
  onEdit,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  isDragging,
}: {
  step: WorkflowStepState;
  evaluators: WorkflowEvaluatorDef[];
  locked?: boolean;
  onRemove: () => void;
  onEdit: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  isDragging: boolean;
}) {
  const def = evaluators.find((e) => e.id === step.evaluatorId)
    ?? (step.evaluatorId === "fit_model" ? FIT_MODEL_EVALUATOR : undefined);
  const displayName = def?.name ?? step.methodName;
  const filename = step.args.filename != null ? String(step.args.filename) : null;

  return (
    <div
      draggable={!locked}
      onDragStart={locked ? undefined : onDragStart}
      onDragEnter={locked ? undefined : onDragEnter}
      onDragEnd={locked ? undefined : onDragEnd}
      onDragOver={locked ? undefined : onDragOver}
      onClick={locked ? undefined : onEdit}
      className={cn(
        "relative border-2 transition-colors",
        "p-4 sm:p-5 w-[220px] sm:w-[260px] min-h-[100px] sm:min-h-[120px]",
        "flex flex-col text-left select-none",
        locked
          ? "border-[#505050] bg-[#1a1a1a] cursor-default opacity-80"
          : "card-hover-fade border-[#404040] bg-[#282828] hover:bg-[#303030] cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      {!locked && (
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
          className="absolute top-2 right-2 text-white/60 hover:text-red-500 transition-colors z-10"
          title="Remove step"
        >
          <X className="w-5 h-5" />
        </div>
      )}

      <div className="flex items-start gap-2 flex-1">
        {!locked && <GripVertical className="w-4 h-4 text-white/30 mt-1 flex-shrink-0" />}
        <div className="flex flex-col gap-1">
          <div className="text-white text-base sm:text-lg font-display font-bold pr-6">
            {displayName}
          </div>
          {locked && (
            <div className="text-white/40 text-xs font-display">Train data</div>
          )}
          {filename && (
            <div className="text-white/50 text-sm font-display truncate">
              {filename}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
