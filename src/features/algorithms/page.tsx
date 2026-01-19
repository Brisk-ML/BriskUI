import { AlgorithmGrid } from "@/shared/components/algorithms/AlgorithmGrid";
import { AlgorithmWrappersList } from "@/shared/components/algorithms/AlgorithmWrappersList";
import { ProjectHeader } from "@/shared/components/layout/ProjectHeader";

export default function AlgorithmsPage() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      <ProjectHeader />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col gap-3 sm:gap-4">
          {/* Algorithm Selection Grid */}
          <AlgorithmGrid />

          {/* Algorithm Wrappers List */}
          <AlgorithmWrappersList />
        </div>
      </div>
    </div>
  );
}
