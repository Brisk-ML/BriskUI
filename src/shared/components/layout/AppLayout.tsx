import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EditProjectModal } from "@/shared/components/modals/EditProjectModal";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const isProjectWizard = pathname === "/project";

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
