import { cn } from "@/lib/utils";
import type { AlgorithmWrapper } from "../types";

interface AlgorithmWrapperCardProps {
  wrapper: AlgorithmWrapper;
  onClick?: () => void;
  className?: string;
}

export function AlgorithmWrapperCard({
  wrapper,
  onClick,
  className,
}: AlgorithmWrapperCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        // Responsive sizing: maintain aspect ratio, scale with container
        "w-full aspect-[3/4] max-w-[150px] mx-auto",
        "min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]",
        "bg-[#121212] border border-[#363636]",
        "flex flex-col overflow-hidden",
        onClick && "cursor-pointer hover:bg-[#1a1a1a] transition-colors",
        className,
      )}
    >
      {/* Top Section - Display Name */}
      <div className="flex flex-col gap-1 p-1 min-h-[60px] sm:min-h-[75px] lg:min-h-[85px]">
        <p className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-['Montserrat'] leading-normal px-[3px] line-clamp-2">
          {wrapper.displayName}
        </p>
        <div className="h-[1px] bg-white w-[85%] mx-auto" />
      </div>

      {/* Bottom Section - Details */}
      <div className="flex flex-col gap-1 sm:gap-2 px-2 pb-2 pt-1 justify-center flex-1 text-[#b3b3b3]">
        <p className="text-[14px] sm:text-[16px] lg:text-[18px] font-['Montserrat'] leading-normal truncate">
          {wrapper.name}
        </p>
        <p className="text-[14px] sm:text-[16px] lg:text-[18px] font-['Montserrat'] leading-normal truncate">
          {wrapper.className}
        </p>
        <p className="text-[13px] sm:text-[14px] lg:text-[16px] font-['Montserrat'] leading-normal">
          Hyperparameter Grid: {wrapper.hasHyperparameterGrid ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}
