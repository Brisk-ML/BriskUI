import { type MouseEvent, useState } from "react";
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
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

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
          "w-[56px] md:w-[60px] lg:w-[72px] xl:w-[88px]",
          "hover:w-[220px] md:hover:w-[240px] lg:hover:w-[260px] xl:hover:w-[300px]",
          "items-stretch",
          "py-1.5 px-1.5 md:py-2 md:px-2 lg:py-2.5 lg:px-2.5 xl:p-[10px]",
          "gap-0.5 md:gap-1 lg:gap-2 xl:gap-[10px]",
          "overflow-x-hidden overflow-y-auto",
          "transition-[width] duration-300 ease-out",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "hover:[&::-webkit-scrollbar-thumb]:bg-white/30", // Show scrollbar on hover
        )}
      >
        <Link
          to="/"
          className={cn(
            "flex items-center justify-center shrink-0 min-w-0",
            "w-[56px] md:w-[60px] lg:w-[72px] xl:w-[88px]",
          )}
          title="Brisk"
        >
          <span
            className={cn(
              "text-white font-bold tracking-[-0.52px] leading-tight font-display whitespace-nowrap",
              "text-[13px] md:text-[14px] lg:text-base xl:text-[27.5px]",
            )}
          >
            Brisk
          </span>
        </Link>

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <div
            key={group.name}
            className="flex flex-col gap-1 md:gap-2 lg:gap-3 xl:gap-[32px] shrink-0 w-full items-stretch"
          >
            {/* Divider */}
            <div className="h-0 border-t border-white/20 shrink-0 w-6 md:w-8 lg:w-10 xl:w-[50px] group-hover:w-[180px] md:group-hover:w-[200px] lg:group-hover:w-[220px] xl:group-hover:w-[250px] transition-all duration-300" />

            {/* Navigation Items */}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredHref === item.href;

              return (
                <div key={item.href} className="relative group/item">
                  {isHovered && (
                    <div className="absolute -left-[1px] top-[-4px] md:top-[-6px] lg:top-[-8px] xl:top-[-12px] h-8 md:h-9 lg:h-10 xl:h-[75px] w-full pointer-events-none transition-opacity duration-300">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                        <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
                    </div>
                  )}

                  <Link
                    to={item.href}
                    onClick={(e) => handleItemClick(e, item)}
                    onMouseEnter={() => setHoveredHref(item.href)}
                    onMouseLeave={() => setHoveredHref(null)}
                    className="flex items-center relative z-10 w-full h-7 md:h-8 lg:h-10 xl:h-[50px] min-h-[28px] md:min-h-[32px] lg:min-h-[40px] xl:min-h-[50px]"
                    title={item.label}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center shrink-0",
                        "w-[56px] md:w-[60px] lg:w-[72px] xl:w-[88px]",
                      )}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-[48px] xl:h-[48px]"
                      />
                    </div>
                    <span
                      className={cn(
                        "text-white text-sm md:text-base lg:text-lg xl:text-[28px] font-display leading-none whitespace-nowrap overflow-hidden",
                        "transition-[max-width,opacity] duration-300 ease-out",
                        isActive ? "font-bold" : "font-normal",
                        "max-w-0 opacity-0 group-hover:max-w-[160px] md:group-hover:max-w-[180px] lg:group-hover:max-w-[200px] group-hover:opacity-100",
                      )}
                    >
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
