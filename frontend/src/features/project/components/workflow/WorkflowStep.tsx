import { ArrowRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
  type WorkflowEvaluatorDef,
  type WorkflowArgField,
} from "@/features/project/constants/workflowEvaluators";
import { useProjectWizardStore } from "@/features/project/stores/useProjectWizardStore";
import {
  useWorkflowStepStore,
  type WorkflowStep as WorkflowStepType,
} from "@/features/project/stores/useWorkflowStepStore";

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

interface AddEvaluatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluator: WorkflowEvaluatorDef | null;
  problemType: "classification" | "regression";
  onAdd: (args: Record<string, unknown>) => void;
}

function AddEvaluatorModal({
  open,
  onOpenChange,
  evaluator,
  problemType,
  onAdd,
}: AddEvaluatorModalProps) {
  const [formArgs, setFormArgs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open && evaluator) {
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
  }, [open, evaluator, problemType]);

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

  const handleAdd = () => {
    if (!evaluator) return;
    const expanded = expandDataArgs(formArgs);
    onAdd(expanded);
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
              Add {evaluator.name}
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

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handleAdd}
              className={`btn-add-hover ${STYLES.bgPrimary} text-white h-10 sm:h-11 md:h-12 px-6 text-base sm:text-lg font-display`}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

export function WorkflowStep() {
  const { problemType } = useProjectWizardStore();
  const { steps, addStep, removeStep, moveStep } = useWorkflowStepStore();

  const evaluators = useMemo(
    () => getWorkflowEvaluatorsForProblemType(problemType),
    [problemType]
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] =
    useState<WorkflowEvaluatorDef | null>(null);

  const handleCardClick = (evaluator: WorkflowEvaluatorDef) => {
    setSelectedEvaluator(evaluator);
    setShowAddModal(true);
  };

  const handleAddStep = (args: Record<string, unknown>) => {
    if (!selectedEvaluator) return;
    addStep({
      evaluatorId: selectedEvaluator.id,
      methodName: selectedEvaluator.methodName,
      args,
    });
    setSelectedEvaluator(null);
  };

  return (
    <div className="w-full max-w-[1055px] px-4 xl:px-0 flex flex-col gap-4 sm:gap-6 mx-auto">
      {/* Evaluator cards - filtered by problem type */}
      <div>
        <h2 className="text-white text-lg sm:text-xl font-display font-bold mb-3">
          Add evaluator steps ({problemType})
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
          Workflow
        </h2>

        {steps.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-white/60 text-lg sm:text-xl font-display">
              Click an evaluator above to add it to the workflow. Order added =
              order executed.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                <StepCard
                  step={step}
                  evaluators={evaluators}
                  onRemove={() => removeStep(step.id)}
                  onMoveUp={index > 0 ? () => moveStep(step.id, "up") : undefined}
                  onMoveDown={
                    index < steps.length - 1
                      ? () => moveStep(step.id, "down")
                      : undefined
                  }
                />
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 flex-shrink-0" />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <AddEvaluatorModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        evaluator={selectedEvaluator}
        problemType={problemType}
        onAdd={handleAddStep}
      />
    </div>
  );
}

function StepCard({
  step,
  evaluators,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  step: WorkflowStepType;
  evaluators: WorkflowEvaluatorDef[];
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const def = evaluators.find((e) => e.id === step.evaluatorId);
  const displayName = def?.name ?? step.methodName;
  const filename = step.args.filename != null ? String(step.args.filename) : null;

  return (
    <div
      className={cn(
        "card-hover-fade relative border-2 border-[#404040] bg-[#282828] p-3 sm:p-4 w-[150px] sm:w-[170px]",
      )}
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>

      <div className="flex flex-col gap-1">
        <div className="text-white text-sm sm:text-base font-display font-bold truncate pr-6">
          {displayName}
        </div>
        {filename && (
          <div className="text-white/50 text-xs font-display truncate">
            {filename}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
