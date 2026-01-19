import { ArrowRight, X } from "lucide-react";
import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
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

const WORKFLOW_METHODS = [
  { id: "evaluate-model", name: "Evaluate Model" },
  { id: "evaluate-model-cv", name: "Evaluate Model CV" },
  { id: "plot-predicted-observed", name: "Plot Predicted vs Observed" },
  { id: "plot-learning-curve", name: "Plot Learning Curve" },
  { id: "plot-feature-importance", name: "Plot Feature Importance" },
  { id: "plot-residuals", name: "Plot Residuals" },
  { id: "hyperparameter-tuning", name: "Hyperparameter Tuning" },
  { id: "confusion-matrix", name: "Confusion Matrix" },
  { id: "plot-roc-curve", name: "Plot ROC Curve" },
];

interface WorkflowNode {
  id: string;
  methodId: string;
  methodName: string;
  displayName: string;
  className: string;
  hyperparameterGrid: boolean;
  model?: string;
  cv?: string;
  metrics?: string;
  filename?: string;
}

export function WorkflowStep() {
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(
    null,
  );

  const [modalModel, setModalModel] = useState("Model");
  const [modalX, setModalX] = useState("");
  const [modalY, setModalY] = useState("");
  const [modalMetrics, setModalMetrics] = useState("");
  const [modalFilename, setModalFilename] = useState("");
  const [modalCV, setModalCV] = useState("5");

  const handleMethodClick = (methodId: string) => {
    setSelectedMethod(methodId);
    const method = WORKFLOW_METHODS.find((m) => m.id === methodId);
    if (method) {
      setModalFilename(method.name.toLowerCase().replace(/\s+/g, "_"));
    }
    setShowAddModal(true);
  };

  const handleAddToWorkflow = () => {
    if (!selectedMethod) return;

    const method = WORKFLOW_METHODS.find((m) => m.id === selectedMethod);
    if (!method) return;

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      methodId: selectedMethod,
      methodName: method.name,
      displayName: method.name,
      className: method.name.split(" ")[0],
      hyperparameterGrid: selectedMethod === "hyperparameter-tuning",
      model: modalModel,
      cv: modalCV,
      metrics: modalMetrics,
      filename: modalFilename,
    };

    setWorkflowNodes([...workflowNodes, newNode]);
    setShowAddModal(false);
    resetModalForm();
  };

  const resetModalForm = () => {
    setModalModel("Model");
    setModalX("");
    setModalY("");
    setModalMetrics("");
    setModalFilename("");
    setModalCV("5");
    setSelectedMethod(null);
  };

  const removeNode = (nodeId: string) => {
    setWorkflowNodes(workflowNodes.filter((n) => n.id !== nodeId));
  };

  return (
    <div className="w-full max-w-[1055px] px-4 xl:px-0 flex flex-col gap-4 sm:gap-6 mx-auto">
      {/* Method Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {WORKFLOW_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => handleMethodClick(method.id)}
            className={cn(
              "border border-[#404040] bg-[#181818] hover:bg-[#282828] transition-colors",
              "p-3 sm:p-4 flex items-center justify-center text-center",
              "min-h-[60px] sm:min-h-[80px]",
            )}
          >
            <span className="text-white text-sm sm:text-base lg:text-[18px] font-display leading-tight">
              {method.name}
            </span>
          </button>
        ))}
      </div>

      {/* Workflow Builder */}
      <div className="bg-[#181818] border-2 border-[#404040] p-4 sm:p-6 min-h-[300px]">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white font-display">
            Workflow
          </h2>
        </div>

        {/* Workflow Pipeline */}
        {workflowNodes.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-white/60 text-lg sm:text-xl font-display">
              Click a method above to add it to the workflow
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
            {workflowNodes.map((node, index) => (
              <Fragment key={node.id}>
                {/* Node Card */}
                <div className="relative border border-[#404040] bg-[#282828] p-3 sm:p-4 w-[140px] sm:w-[160px]">
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeNode(node.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>

                  <div className="text-white text-sm sm:text-base font-display font-bold mb-2 truncate">
                    {node.displayName}
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-display">
                    {node.className}
                  </div>
                  {node.model && (
                    <div className="text-white/60 text-xs sm:text-sm font-display">
                      {node.model}
                    </div>
                  )}
                  {node.cv && (
                    <div className="text-white/60 text-xs sm:text-sm font-display">
                      cv={node.cv}
                    </div>
                  )}
                  <div className="text-white/40 text-xs font-display mt-1">
                    Hyperparameter Grid:{" "}
                    {node.hyperparameterGrid ? "Yes" : "No"}
                  </div>
                </div>

                {/* Arrow between nodes */}
                {index < workflowNodes.length - 1 && (
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 flex-shrink-0" />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Add Method Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#181818] border-[#404040] text-white max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-display">
              Add{" "}
              {selectedMethod
                ? WORKFLOW_METHODS.find((m) => m.id === selectedMethod)?.name
                : "Method"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Model */}
            <div>
              <Label className="text-white text-base font-display mb-2 block">
                Model
              </Label>
              <Select value={modalModel} onValueChange={setModalModel}>
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem value="Model" className="text-white">
                    Model
                  </SelectItem>
                  <SelectItem value="Ridge" className="text-white">
                    Ridge
                  </SelectItem>
                  <SelectItem value="Lasso" className="text-white">
                    Lasso
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* X */}
            <div>
              <Label className="text-white text-base font-display mb-2 block">
                X
              </Label>
              <Select value={modalX} onValueChange={setModalX}>
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem value="X_train" className="text-white">
                    X_train
                  </SelectItem>
                  <SelectItem value="X_test" className="text-white">
                    X_test
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Y */}
            <div>
              <Label className="text-white text-base font-display mb-2 block">
                Y
              </Label>
              <Select value={modalY} onValueChange={setModalY}>
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem value="y_train" className="text-white">
                    y_train
                  </SelectItem>
                  <SelectItem value="y_test" className="text-white">
                    y_test
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics */}
            <div>
              <Label className="text-white text-base font-display mb-2 block">
                Metrics
              </Label>
              <Select value={modalMetrics} onValueChange={setModalMetrics}>
                <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#282828] border-[#404040]">
                  <SelectItem value="MAE" className="text-white">
                    MAE
                  </SelectItem>
                  <SelectItem value="MSE" className="text-white">
                    MSE
                  </SelectItem>
                  <SelectItem value="RMSE" className="text-white">
                    RMSE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filename */}
            <div>
              <Label className="text-white text-base font-display mb-2 block">
                Filename
              </Label>
              <Input
                value={modalFilename}
                onChange={(e) => setModalFilename(e.target.value)}
                placeholder="eval_model_cv"
                className="bg-[#282828] border-[#404040] text-white"
              />
            </div>

            {/* CV */}
            <div>
              <Label className="text-white text-base font-display mb-2 block">
                CV
              </Label>
              <Input
                value={modalCV}
                onChange={(e) => setModalCV(e.target.value)}
                placeholder="5"
                className="bg-[#282828] border-[#404040] text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleAddToWorkflow}
            className="w-full mt-4 bg-[#006b4c] hover:bg-[#005a3f] text-white h-[44px] text-lg font-display"
          >
            Add
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
