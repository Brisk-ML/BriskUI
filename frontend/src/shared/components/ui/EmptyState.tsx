import type { LucideIcon } from "lucide-react";
import type * as React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 px-4 text-center">
      {Icon && (
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-bg-tertiary flex items-center justify-center mb-3 sm:mb-4">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-text-tertiary" />
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-text-secondary max-w-md mb-4 sm:mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
