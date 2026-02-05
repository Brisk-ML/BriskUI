import { cn } from "@/lib/utils";
import type { WizardAlgorithmWrapper } from "@/features/project/stores/useAlgorithmsStepStore";
import { STYLES } from "@/shared/constants/colors";

interface AlgorithmWrapperCardProps {
  wrapper: WizardAlgorithmWrapper;
  onClick?: () => void;
  className?: string;
}

export function AlgorithmWrapperCard({
  wrapper,
  onClick,
  className,
}: AlgorithmWrapperCardProps) {
  const Comp = onClick ? "button" : "div";
  const hasCustomParams = !wrapper.useDefaults && Object.keys(wrapper.defaultParams).length > 0;
  
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full aspect-[3/4] max-w-[150px] mx-auto",
        "min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]",
        `${STYLES.bgDark} border ${STYLES.borderSecondary}`,
        "flex flex-col overflow-hidden relative",
        "card-hover-fade transition-colors duration-300",
        onClick && `cursor-pointer ${STYLES.hoverBgTertiary} text-left`,
        className,
      )}
    >
      <div className="flex flex-col gap-1 p-1 h-[60px] sm:h-[75px] lg:h-[85px] shrink-0">
        <p className="text-white text-[18px] sm:text-[22px] lg:text-[24px] font-display leading-normal px-[3px] line-clamp-2">
          {wrapper.displayName}
        </p>
        <div className="h-[1px] bg-white w-[85%] mx-auto mt-auto" />
      </div>

      <div className="flex flex-col gap-1 sm:gap-2 px-2 pb-2 pt-1 flex-1 min-h-0 text-[#b3b3b3]">
        <p className="text-[14px] sm:text-[16px] lg:text-[18px] font-display leading-normal truncate">
          {wrapper.name}
        </p>
        <p className="text-[14px] sm:text-[16px] lg:text-[18px] font-display leading-normal truncate">
          {wrapper.className}
        </p>
        <p className="text-[13px] sm:text-[14px] lg:text-[16px] font-display leading-normal mt-auto pt-1">
          Custom Params: {hasCustomParams ? "Yes" : "No"}
        </p>
      </div>
    </Comp>
  );
}
