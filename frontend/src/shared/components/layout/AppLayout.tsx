import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EditProjectModal } from "@/shared/components/modals/EditProjectModal";
import { usePendingChangesStore } from "@/shared/stores/usePendingChangesStore";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const isProjectWizard = pathname === "/project";
  const hasChanges = usePendingChangesStore((state) => state.hasChanges);

  // Warn user before closing tab if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        // Standard way to trigger the browser's "unsaved changes" dialog
        e.preventDefault();
        // Legacy support for older browsers
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  return (
    <div
      className={cn(
        "h-dvh bg-bg-primary flex flex-col md:flex-row",
        isProjectWizard
          ? "overflow-x-visible overflow-y-hidden"
          : "overflow-hidden",
      )}
    >
      <Sidebar />
      <main
        className={cn(
          "flex-1 md:ml-[60px] lg:ml-[72px] xl:ml-[88px] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-y-auto w-full max-w-full",
          isProjectWizard ? "overflow-x-visible" : "overflow-x-hidden",
        )}
      >
        {children}
      </main>
      <EditProjectModal />
    </div>
  );
}
