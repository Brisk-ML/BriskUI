import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AlgorithmWrapperCard } from "@/features/algorithms/components/AlgorithmWrapperCard";
import { useAlgorithmWrapperStore } from "@/features/algorithms/stores/useAlgorithmWrapperStore";
import { Input } from "@/shared/components/ui/input";

export function AlgorithmWrappersList() {
  const { wrappers } = useAlgorithmWrapperStore();
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="bg-[#181818] border-2 border-[#404040] h-[400px] sm:h-[480px] lg:h-[552px] relative overflow-hidden">
      {/* Header - Responsive layout: stacked on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 px-3 sm:px-[18px] py-2 sm:py-3 border-b border-[#404040]">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="text-[#ebebeb] text-[24px] sm:text-[30px] lg:text-[36px] font-bold font-['Montserrat']">
            Algorithms
          </h2>
          <span className="text-[#b3b3b3] text-[24px] sm:text-[30px] lg:text-[36px] font-bold font-['Montserrat'] opacity-60">
            {wrappers.length}
          </span>
        </div>

        {/* Search - Responsive width */}
        <div className="relative w-full sm:w-[160px] lg:w-[180px]">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="bg-[#282828] border-[#404040] text-white h-[30px] text-[16px] sm:text-[18px] placeholder:text-white/60 pr-8"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] text-white/60 pointer-events-none" />
        </div>
      </div>

      {/* Horizontal Line Under Header */}
      <div className="h-[2px] bg-white/40 mx-3 sm:mx-[18px]" />

      {/* Wrappers Grid - Responsive height calculation */}
      <div className="p-2 overflow-y-auto h-[calc(100%-60px)] sm:h-[calc(100%-73px)]">
        {filteredWrappers.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-white/60 text-[16px] sm:text-[20px] lg:text-[24px] font-['Montserrat'] text-center">
              {searchQuery
                ? "No algorithms match your search"
                : "No algorithms added yet. Select from the grid above to add."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filteredWrappers.map((wrapper) => (
              <AlgorithmWrapperCard key={wrapper.id} wrapper={wrapper} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

