import type { ReactNode } from "react";
import { EditProjectModal } from "@/shared/components/modals/EditProjectModal";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-dvh bg-bg-primary flex flex-col md:flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-[88px] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden overflow-y-auto w-full max-w-full">
        {children}
      </main>
      <EditProjectModal />
    </div>
  );
}
