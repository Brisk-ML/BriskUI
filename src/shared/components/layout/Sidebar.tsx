import type { MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProjectModalStore } from "@/shared/stores/useProjectModalStore";

const navGroups = [
  {
    name: "Project Buttons",
    items: [
      { icon: "/home.svg", href: "/", label: "Home" },
      { icon: "/edit.svg", href: "/edit", label: "Edit" },
    ],
  },
  {
    name: "Configuration",
    items: [
      { icon: "/experiments.svg", href: "/experiments", label: "Experiments" },
      { icon: "/database.svg", href: "/datasets", label: "Datasets" },
      { icon: "/algorithms.svg", href: "/algorithms", label: "Algorithms" },
      { icon: "/metrics.svg", href: "/metrics", label: "Metrics" },
    ],
  },
  {
    name: "Files",
    items: [
      { icon: "/results.svg", href: "/results", label: "Results" },
      { icon: "/files.svg", href: "/files", label: "Files" },
      { icon: "/save.svg", href: "/save", label: "Save" },
    ],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

export function Sidebar() {
  const { pathname } = useLocation();
  const { openEditModal } = useProjectModalStore();

  // Special handling for edit button - opens modal instead of navigating
  const handleItemClick = (
    e: MouseEvent,
    item: { href: string; label: string },
  ) => {
    if (item.href === "/edit") {
      e.preventDefault();
      openEditModal();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "group",
          "hidden md:flex fixed left-0 top-0 h-screen flex-col z-50",
          "backdrop-blur-[10px] bg-[rgba(24,24,24,0.9)]",
          "w-[88px] hover:w-[300px]", // Expands on hover to show labels
          "items-center hover:items-start",
          "p-[10px] gap-[10px]",
          "overflow-x-hidden overflow-y-auto",
          "transition-all duration-300 ease-out",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "hover:[&::-webkit-scrollbar-thumb]:bg-white/30", // Show scrollbar on hover
        )}
      >
        {/* Brisk Logo */}
        <Link
          to="/"
          className="flex flex-col justify-center shrink-0"
          title="Brisk"
        >
          <span className="text-white text-[27.5px] font-bold tracking-[-0.52px] leading-[1.5] font-display whitespace-nowrap">
            Brisk
          </span>
        </Link>

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <div
            key={group.name}
            className={cn(
              "flex flex-col gap-[32px] shrink-0",
              "items-center group-hover:items-start",
              "w-full",
            )}
          >
            {/* Divider */}
            <div className="h-0 border-t border-white/20 shrink-0 w-[50px] group-hover:w-[250px] transition-all duration-300" />

            {/* Navigation Items */}
            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <div key={item.href} className="relative group/item">
                  {isActive && (
                    <div className="absolute -left-[1px] top-[-12px] h-[75px] w-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                        <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
                    </div>
                  )}

                  {!isActive && (
                    <div className="absolute -left-[1px] top-[-12px] h-[75px] w-full pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                        <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
                    </div>
                  )}

                  {/* Navigation Item */}
                  <Link
                    to={item.href}
                    onClick={(e) => handleItemClick(e, item)}
                    className={cn(
                      "flex items-center relative z-10",
                      "h-[50px]",
                      "group-hover:gap-[24px] group-hover:px-[9px] group-hover:py-[4px]",
                      "justify-center group-hover:justify-start",
                    )}
                    title={item.label}
                  >
                    {/* Icon */}
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-[48px] h-[48px] shrink-0"
                    />

                    <span className="text-white text-[28px] font-normal font-display leading-none whitespace-nowrap max-w-0 group-hover:max-w-[200px] overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 bg-bg-secondary border-t border-border-primary z-[100] pb-safe"
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        <div className="flex items-center overflow-x-auto px-2 py-3 gap-1">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleItemClick(e, item)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-shrink-0 min-w-[70px]",
                  isActive ? "bg-accent-500/10" : "",
                )}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={cn(
                    "w-6 h-6 transition-all",
                    isActive
                      ? "brightness-100 invert-[.5] sepia-[1] saturate-[5] hue-rotate-[130deg]"
                      : "opacity-40 grayscale",
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-medium uppercase tracking-tighter text-center",
                    isActive ? "text-accent-500" : "text-text-tertiary",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
