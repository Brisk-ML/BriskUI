import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AlgorithmWrapperCard } from "@/features/algorithms/components/AlgorithmWrapperCard";
import { ViewAlgorithmModal } from "@/features/algorithms/components/ViewAlgorithmModal";
import { useAlgorithmsStepStore, type WizardAlgorithmWrapper } from "@/features/project/stores/useAlgorithmsStepStore";
import { usePendingChangesStore, type AlgorithmWrapperState } from "@/shared/stores/usePendingChangesStore";
import { Input } from "@/shared/components/ui/input";
import { STYLES } from "@/shared/constants/colors";

export type AlgorithmWrapperListMode = "wizard" | "standalone";

interface AlgorithmWrappersListProps {
  mode?: AlgorithmWrapperListMode;
}

// Union type for wrapper that works with both stores
type AlgorithmWrapper = WizardAlgorithmWrapper | AlgorithmWrapperState;

export function AlgorithmWrappersList({ mode = "wizard" }: AlgorithmWrappersListProps) {
  // Use appropriate store based on mode
  const wizardStore = useAlgorithmsStepStore();
  const pendingStore = usePendingChangesStore();
  
  const wrappers = mode === "wizard" ? wizardStore.wrappers : pendingStore.algorithmWrappers;
  const deleteWrapper = mode === "wizard" 
    ? wizardStore.deleteWrapper 
    : pendingStore.deleteAlgorithmWrapper;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingWrapper, setViewingWrapper] = useState<AlgorithmWrapper | null>(
    null,
  );

  const filteredWrappers = useMemo(() => {
    if (!searchQuery.trim()) return wrappers;

    const query = searchQuery.toLowerCase();
    return wrappers.filter(
      (wrapper) =>
        wrapper.name.toLowerCase().includes(query) ||
        wrapper.displayName.toLowerCase().includes(query) ||
        wrapper.className.toLowerCase().includes(query),
    );
  }, [wrappers, searchQuery]);

  return (
    <>
      <div
        className={`${STYLES.bgCard} border-2 ${STYLES.border} h-[400px] sm:h-[480px] lg:h-[552px] relative overflow-hidden`}
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 px-3 sm:px-[18px] py-2 sm:py-3 border-b ${STYLES.border}`}
        >
          <div className="flex items-center">
            <h2 className="h1-underline text-[#ebebeb] text-[24px] sm:text-[30px] lg:text-[36px] font-bold font-display">
              Existing Algorithms
            </h2>
          </div>

          <div className="relative w-full sm:w-[160px] lg:w-[180px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className={`${STYLES.bgCardAlt} ${STYLES.border} text-white h-[30px] text-[16px] sm:text-[18px] placeholder:text-white/60 pr-8`}
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] text-white/60 pointer-events-none" />
          </div>
        </div>

        <div className="p-2 overflow-y-auto h-[calc(100%-60px)] sm:h-[calc(100%-73px)]">
          {filteredWrappers.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <p className="text-white/60 text-[16px] sm:text-[20px] lg:text-[24px] font-display text-center">
                {searchQuery
                  ? "No algorithms match your search"
                  : "No algorithms added yet. Select from the grid above to add."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {filteredWrappers.map((wrapper) => (
                <AlgorithmWrapperCard
                  key={wrapper.id}
                  wrapper={wrapper}
                  onClick={() => setViewingWrapper(wrapper)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ViewAlgorithmModal
        open={!!viewingWrapper}
        onClose={() => setViewingWrapper(null)}
        wrapper={viewingWrapper}
        onRemove={deleteWrapper}
      />
    </>
  );
}
