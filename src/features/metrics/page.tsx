import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ProjectHeader } from "@/shared/components/layout/ProjectHeader";
import { Input } from "@/shared/components/ui/input";

const METRICS_CATALOG = [
  {
    id: "mae",
    name: "Mean Absolute Error",
    shortName: "MAE",
    description:
      "Average of absolute differences between predictions and actual values",
  },
  {
    id: "mse",
    name: "Mean Squared Error",
    shortName: "MSE",
    description:
      "Average of squared differences between predictions and actual values",
  },
  {
    id: "r2",
    name: "R2 Score",
    shortName: "R2",
    description:
      "Coefficient of determination measuring the proportion of variance explained",
  },
  {
    id: "mpl",
    name: "Mean Pinball Loss",
    shortName: "MPL",
    description: "Loss function for quantile regression",
  },
];

interface MetricCardProps {
  metric: (typeof METRICS_CATALOG)[number];
  isSelected: boolean;
  onClick: () => void;
}

function MetricCard({ metric, isSelected, onClick }: MetricCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-hover-fade w-[100px] sm:w-[110px] lg:w-[120px] h-[70px] sm:h-[75px] lg:h-[80px] flex items-center justify-center p-2 sm:p-3 relative",
        "border transition-all duration-300 text-center",
        isSelected
          ? "bg-[#282828] border-white"
          : "bg-[#181818] border-[#404040] hover:bg-[#282828] hover:border-[#606060]",
      )}
    >
      <p className="text-white text-sm sm:text-base lg:text-[18px] font-display leading-tight">
        {metric.name}
      </p>
    </button>
  );
}

export default function MetricsPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle metric selection - add if not selected, remove if already selected
  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId],
    );
  };

  // Filter metrics by search query (searches both name and short name)
  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return METRICS_CATALOG;

    const query = searchQuery.toLowerCase();
    return METRICS_CATALOG.filter(
      (metric) =>
        metric.name.toLowerCase().includes(query) ||
        metric.shortName.toLowerCase().includes(query),
    );
  }, [searchQuery]);

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
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Metrics Container */}
          <div className="bg-[#181818] border-2 border-[#404040] min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
            {/* Header with Search */}
            <div className="flex justify-end p-2 sm:p-3">
              <div className="relative w-[120px] sm:w-[140px] lg:w-[160px]">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="bg-[#282828] border-[#404040] text-white h-[28px] sm:h-[30px] text-sm sm:text-base placeholder:text-white/60 pr-8"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60 pointer-events-none" />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-3 sm:p-4">
              <div className="flex flex-wrap gap-2">
                {filteredMetrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    isSelected={selectedMetrics.includes(metric.id)}
                    onClick={() => handleMetricToggle(metric.id)}
                  />
                ))}
              </div>

              {filteredMetrics.length === 0 && (
                <div className="flex items-center justify-center h-[150px] sm:h-[200px]">
                  <p className="text-white/60 text-base sm:text-lg lg:text-xl font-display">
                    No metrics match your search
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
