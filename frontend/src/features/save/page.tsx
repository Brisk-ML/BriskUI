import { ProjectHeader } from "@/shared/components/layout/ProjectHeader";

export default function SavePage() {
  return (
    <div className="min-h-screen bg-bg-primary pb-20 md:pb-0">
      <ProjectHeader />
      <div className="p-4 sm:p-6 lg:p-10">
        <div className="flex items-center justify-center h-[200px] sm:h-[300px] lg:h-[400px] border border-dashed border-border-secondary rounded-lg">
          <p className="text-text-tertiary text-sm sm:text-base lg:text-lg text-center px-4">
            Save page coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
