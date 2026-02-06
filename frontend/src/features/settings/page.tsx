import { Settings } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-bg-primary pb-20 md:pb-0">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        <EmptyState
          icon={Settings}
          title="Settings"
          description="System configuration and user preferences coming soon"
        />
      </div>
    </div>
  );
}
