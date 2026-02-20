import { cn } from "@/lib/utils";
import { STYLES } from "@/shared/constants/colors";
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
      type="button"
      onClick={onClick}
      className={cn(
        "aspect-square w-full max-w-[150px] mx-auto",
        "min-h-[120px] sm:min-h-[140px] lg:h-[150px]",
        `${STYLES.bgCard} border ${STYLES.border} relative`,
        `${STYLES.hoverBgCardAlt} ${STYLES.borderHover} transition-all duration-300`,
        "flex items-center justify-center p-3 sm:p-4",
        "cursor-pointer card-hover-fade",
        className,
      )}
    >
      <p className="text-white text-[20px] sm:text-[22px] lg:text-[24px] font-display text-center leading-normal">
        {algorithm.name}
      </p>
    </button>
  );
}
