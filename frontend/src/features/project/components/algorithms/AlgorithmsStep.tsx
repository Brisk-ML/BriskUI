import { AlgorithmGrid } from "@/shared/components/algorithms/AlgorithmGrid";
import { AlgorithmWrappersList } from "@/shared/components/algorithms/AlgorithmWrappersList";

export function AlgorithmsStep() {
  return (
    <div className="w-full max-w-[1055px] xl:px-0 flex flex-col gap-3 sm:gap-4 mx-auto px-2 sm:px-4">
      {/* Algorithm Selection Grid */}
      <AlgorithmGrid />

      {/* Algorithm Wrappers List */}
      <AlgorithmWrappersList />
    </div>
  );
}
