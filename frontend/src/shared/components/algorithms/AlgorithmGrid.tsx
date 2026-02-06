import { useMemo, useState } from "react";
import { AddAlgorithmModal } from "@/features/algorithms/components/AddAlgorithmModal";
import { AlgorithmCard } from "@/features/algorithms/components/AlgorithmCard";
import { ALGORITHMS_CATALOG } from "@/features/algorithms/constants/algorithmsCatalog";
import type { AlgorithmCatalogItem } from "@/features/algorithms/types";
import { useProjectWizardStore } from "@/features/project/stores/useProjectWizardStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import { STYLES } from "@/shared/constants/colors";

export type AlgorithmGridMode = "wizard" | "standalone";

interface AlgorithmGridProps {
  mode?: AlgorithmGridMode;
}

export function AlgorithmGrid({ mode = "wizard" }: AlgorithmGridProps) {
  // Use the appropriate store based on mode
  const wizardProblemType = useProjectWizardStore((s) => s.problemType);
  const projectProblemType = useProjectStore((s) => s.projectType);
  
  const problemType = mode === "wizard" ? wizardProblemType : projectProblemType;
  
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<AlgorithmCatalogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter algorithms based on the selected problem type
  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS_CATALOG.filter(
      (algorithm) => algorithm.type === problemType
    );
  }, [problemType]);

  const handleAlgorithmClick = (algorithm: AlgorithmCatalogItem) => {
    setSelectedAlgorithm(algorithm);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAlgorithm(null), 200);
  };

  return (
    <>
      <div
        className={`${STYLES.bgDark} border-2 ${STYLES.borderSecondary} p-2 overflow-hidden`}
      >
        <div className="px-2 mb-5 pt-1">
          <h2 className="h1-underline text-[#ebebeb] text-[24px] sm:text-[30px] lg:text-[36px] font-bold font-display">
            Add {problemType === "classification" ? "Classification" : "Regression"} Algorithms
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredAlgorithms.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.id}
              algorithm={algorithm}
              onClick={() => handleAlgorithmClick(algorithm)}
            />
          ))}
        </div>
      </div>

      <AddAlgorithmModal
        open={isModalOpen}
        onClose={handleCloseModal}
        algorithm={selectedAlgorithm}
        mode={mode}
      />
    </>
  );
}
