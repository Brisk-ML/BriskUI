import { useEffect, useState } from "react";
import { getExperimentsData } from "@/api";
import { AlgorithmGrid } from "@/shared/components/algorithms/AlgorithmGrid";
import { AlgorithmWrappersList } from "@/shared/components/algorithms/AlgorithmWrappersList";
import { usePendingChangesStore, type AlgorithmWrapperState } from "@/shared/stores/usePendingChangesStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";
import { SKLEARN_CLASS_MODULES } from "@/features/project/stores/useAlgorithmsStepStore";

export default function AlgorithmsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setAlgorithmWrappers, setProblemType, markSectionLoaded } = usePendingChangesStore();
  const { projectType } = useProjectStore();

  // Load existing algorithms from backend on mount
  useEffect(() => {
    const loadAlgorithms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getExperimentsData();
        
        // Convert backend algorithms to AlgorithmWrapperState format
        const wrappers: AlgorithmWrapperState[] = data.algorithms.map((alg, index) => ({
          id: `wrapper-loaded-${index}-${Date.now()}`,
          algorithmId: alg.name,
          name: alg.name,
          displayName: alg.display_name,
          className: alg.class_name,
          classModule: alg.class_module || SKLEARN_CLASS_MODULES[alg.class_name] || "sklearn",
          defaultParams: alg.default_params || {},
          searchSpace: alg.search_space || {},
          useDefaults: alg.use_defaults,
        }));
        
        setAlgorithmWrappers(wrappers);
        setProblemType(projectType);
        
        markSectionLoaded("algorithms");
        // Reset hasChanges since we just loaded from backend
        usePendingChangesStore.setState({ hasChanges: false });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load algorithms");
      } finally {
        setIsLoading(false);
      }
    };

    loadAlgorithms();
  }, [setAlgorithmWrappers, setProblemType, projectType]);

  // Sync problem type when it changes
  useEffect(() => {
    setProblemType(projectType);
  }, [projectType, setProblemType]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/60 text-lg font-display">Loading algorithms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-lg font-display">{error}</p>
        </div>
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
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col gap-3 sm:gap-4">
          {/* Algorithm Selection Grid - using standalone mode */}
          <AlgorithmGrid mode="standalone" />

          {/* Algorithm Wrappers List - using standalone mode */}
          <AlgorithmWrappersList mode="standalone" />
        </div>
      </div>
    </div>
  );
}
