import { useState } from "react";
import { AddAlgorithmModal } from "@/features/algorithms/components/AddAlgorithmModal";
import { AlgorithmCard } from "@/features/algorithms/components/AlgorithmCard";
import { ALGORITHMS_CATALOG } from "@/features/algorithms/constants/algorithmsCatalog";
import type { AlgorithmCatalogItem } from "@/features/algorithms/types";

export function AlgorithmGrid() {
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<AlgorithmCatalogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="bg-[#121212] border-2 border-[#363636] p-2 overflow-hidden">
        {/* Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols md, 6 cols lg+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ALGORITHMS_CATALOG.map((algorithm) => (
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
      />
    </>
  );
}

