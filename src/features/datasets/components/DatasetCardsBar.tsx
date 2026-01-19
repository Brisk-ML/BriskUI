import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useDatasetsModalStore } from "../stores/useDatasetsModalStore";
import { useDatasetsStore } from "../stores/useDatasetsStore";

export function DatasetCardsBar() {
  const { datasets, selectedDatasetId, selectDataset } = useDatasetsStore();
  const { openAddDatasetModal } = useDatasetsModalStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -170,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 170,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full bg-[#282828] border-2 border-[#363636] p-4 flex items-center gap-3">
      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={scrollLeft}
        className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#282828] border border-[#404040] hover:bg-[#383838] transition-colors flex items-center justify-center"
        aria-label="Scroll left"
      >
        <img
          src="/arrow-right.svg"
          alt="Scroll left"
          className="w-6 h-6 md:w-8 md:h-8 rotate-180"
        />
      </button>

      {/* Dataset Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {datasets.map((dataset) => {
          const isSelected = selectedDatasetId === dataset.id;
          return (
            <button
              key={dataset.id}
              type="button"
              onClick={() => selectDataset(dataset.id)}
              className={cn(
                "flex-shrink-0 w-[130px] md:w-[150px] h-[80px] md:h-[100px] p-3 border-2 transition-colors",
                "flex flex-col items-start justify-center",
                "cursor-pointer hover:opacity-90",
                isSelected
                  ? "bg-[#006b4c] border-[#00a878]"
                  : "bg-[#121212] border-[#363636] hover:border-[#404040]",
              )}
            >
              <span className="text-white text-sm md:text-base font-display truncate w-full text-left">
                {dataset.name}
              </span>
              <span className="text-[#a0a0a0] text-xs md:text-sm font-mono truncate w-full text-left">
                {dataset.observationsCount} x {dataset.featuresCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Arrow Button */}
      <button
        type="button"
        onClick={scrollRight}
        className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#282828] border border-[#404040] hover:bg-[#383838] transition-colors flex items-center justify-center"
        aria-label="Scroll right"
      >
        <img
          src="/arrow-right.svg"
          alt="Scroll right"
          className="w-6 h-6 md:w-8 md:h-8"
        />
      </button>

      {/* Add Dataset Button */}
      <button
        type="button"
        onClick={openAddDatasetModal}
        className="flex-shrink-0 h-10 md:h-12 px-4 bg-[#006b4c] hover:bg-[#008b5c] border border-[#00a878] transition-colors flex items-center justify-center gap-2"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 md:w-5 md:h-5"
        >
          <path
            d="M10 4V16M4 10H16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white text-sm md:text-base font-display hidden sm:inline">
          Add Dataset
        </span>
      </button>
    </div>
  );
}
