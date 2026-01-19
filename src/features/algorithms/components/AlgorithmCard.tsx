import { cn } from "@/lib/utils";
import type { AlgorithmCatalogItem } from "../types";

interface AlgorithmCardProps {
  algorithm: AlgorithmCatalogItem;
  onClick: () => void;
  className?: string;
}

export function AlgorithmCard({
  algorithm,
  onClick,
  className,
}: AlgorithmCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Responsive sizing: smaller on mobile, full size on lg+
        "aspect-square w-full max-w-[150px] mx-auto",
        "min-h-[120px] sm:min-h-[140px] lg:h-[150px]",
        "bg-[#181818] border border-[#404040]",
        "hover:bg-[#282828] hover:border-[#606060] transition-all duration-200",
        "flex items-center justify-center p-3 sm:p-4",
        "cursor-pointer",
        className,
      )}
    >
      <p className="text-white text-[20px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] text-center leading-normal">
        {algorithm.name}
      </p>
    </button>
  );
}
