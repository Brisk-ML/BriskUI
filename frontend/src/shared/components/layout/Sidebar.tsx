import { type MouseEvent, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProjectModalStore } from "@/shared/stores/useProjectModalStore";
import { usePendingChangesStore } from "@/shared/stores/usePendingChangesStore";

const navGroups = [
  {
    name: "Project Buttons",
    items: [
      { icon: "/home.svg", href: "/", label: "Home" },
      { icon: "/save.svg", href: "/save", label: "Save" },
    ],
  },
  {
    name: "Configuration",
    items: [
      { icon: "/experiments.svg", href: "/experiments", label: "Experiments" },
      { icon: "/database.svg", href: "/datasets", label: "Datasets" },
      { icon: "/algorithms.svg", href: "/algorithms", label: "Algorithms" },
      { icon: "/workflow.svg", href: "/workflow", label: "Workflow" },
      { icon: "/files.svg", href: "/files", label: "Files" },
    ],
  },
];

// Results item (above settings at bottom)
const resultsItem = { icon: "/results.svg", href: "/results", label: "Results" };

// Settings item at the bottom (opens modal instead of navigating)
const settingsItem = { icon: "/settings.svg", href: "/settings", label: "Settings" };

const allNavItems = [...navGroups.flatMap((group) => group.items), resultsItem, settingsItem];

export function Sidebar() {
  const { pathname } = useLocation();
  const { openEditModal } = useProjectModalStore();
  const { hasChanges, isSaving, saveAll } = usePendingChangesStore();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  // Special handling for settings and save buttons
  const handleItemClick = async (
    e: MouseEvent,
    item: { href: string; label: string },
  ) => {
    if (item.href === "/settings") {
      e.preventDefault();
      openEditModal();
    } else if (item.href === "/save") {
      e.preventDefault();
      if (hasChanges && !isSaving) {
        try {
          await saveAll();
        } catch (error) {
          console.error("Failed to save:", error);
        }
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "group",
          "hidden md:flex fixed left-0 top-0 h-screen max-h-screen flex-col z-50",
          "backdrop-blur-[10px] bg-[rgba(24,24,24,0.9)]",
          "w-[64px] md:w-[72px] lg:w-[88px] xl:w-[100px]",
          "hover:w-[240px] md:hover:w-[260px] lg:hover:w-[290px] xl:hover:w-[340px]",
          "items-stretch",
          "py-1.5 px-1.5 md:py-2 md:px-2 lg:py-2.5 lg:px-2.5 xl:p-[10px]",
          "gap-0.5 md:gap-1 lg:gap-2 xl:gap-[10px]",
          "overflow-hidden",
          "transition-[width] duration-300 ease-out",
        )}
      >
        <Link
          to="/"
          className={cn(
            "flex items-center justify-center shrink-0 min-w-0",
            "w-[64px] md:w-[72px] lg:w-[88px] xl:w-[100px]",
          )}
          title="Brisk"
        >
          <img
            src="/brisk-wordmark-light.svg"
            alt="Brisk"
            className="h-5 md:h-6 lg:h-7 xl:h-9 w-auto"
          />
        </Link>

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <div
            key={group.name}
            className="flex flex-col gap-1 md:gap-2 lg:gap-3 xl:gap-[32px] shrink-0 w-full items-stretch"
          >
            {/* Divider */}
            <div className="h-0 border-t border-white/20 shrink-0 ml-4 lg:ml-5 w-8 md:w-10 lg:w-12 xl:w-[60px] group-hover:w-[200px] md:group-hover:w-[220px] lg:group-hover:w-[250px] xl:group-hover:w-[290px] transition-[width] duration-300" />

            {/* Navigation Items */}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredHref === item.href;
              const isSaveButton = item.href === "/save";

              return (
                <div key={item.href} className="relative group/item">
                  {/* Hover indicator - always rendered, visibility controlled by opacity */}
                  {/* Slow fade-out creates a lingering "tail" effect as mouse moves */}
                  <div 
                    className={cn(
                      "absolute -left-[1px] top-[-4px] md:top-[-6px] lg:top-[-8px] xl:top-[-12px] h-8 md:h-9 lg:h-10 xl:h-[75px] w-full pointer-events-none",
                      "transition-opacity ease-out",
                      isHovered 
                        ? "opacity-100 duration-75" // Fast fade-in
                        : "opacity-0 duration-500 delay-100" // Slow fade-out with delay for lingering effect
                    )}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                      <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
                  </div>

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
                        "flex items-center justify-center shrink-0 relative",
                        "w-[64px] md:w-[72px] lg:w-[88px] xl:w-[100px]",
                      )}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className={cn(
                          "w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-[48px] xl:h-[48px]",
                          isSaveButton && isSaving && "opacity-50"
                        )}
                      />
                      {/* Pending changes indicator - blue bubble */}
                      {isSaveButton && hasChanges && (
                        <div className="absolute top-0 right-2 md:right-3 lg:right-4 xl:right-5">
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 rounded-full bg-[#1175d5] animate-pulse">
                            <div className="absolute inset-0 rounded-full bg-[#1175d5] blur-[3px]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-white text-sm md:text-base lg:text-lg xl:text-[28px] font-display leading-tight whitespace-nowrap overflow-hidden",
                        "transition-[max-width,opacity] duration-300 ease-out",
                        isActive ? "font-bold" : "font-normal",
                        "max-w-0 opacity-0 group-hover:max-w-[170px] md:group-hover:max-w-[185px] lg:group-hover:max-w-[200px] xl:group-hover:max-w-[240px] group-hover:opacity-100",
                      )}
                    >
                      {isSaveButton && isSaving ? "Saving..." : item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        ))}

        {/* Results section with divider */}
        <div className="shrink-0 w-full flex flex-col gap-1 md:gap-2 lg:gap-3 xl:gap-[32px]">
          {/* Divider above results */}
          <div className="h-0 border-t border-white/20 shrink-0 ml-4 lg:ml-5 w-8 md:w-10 lg:w-12 xl:w-[60px] group-hover:w-[200px] md:group-hover:w-[220px] lg:group-hover:w-[250px] xl:group-hover:w-[290px] transition-[width] duration-300" />

          {/* Results item */}
          <div className="relative group/item">
            <div 
              className={cn(
                "absolute -left-[1px] top-[-4px] md:top-[-6px] lg:top-[-8px] xl:top-[-12px] h-8 md:h-9 lg:h-10 xl:h-[75px] w-full pointer-events-none",
                "transition-opacity ease-out",
                hoveredHref === resultsItem.href 
                  ? "opacity-100 duration-75"
                  : "opacity-0 duration-500 delay-100"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
            </div>

            <Link
              to={resultsItem.href}
              onMouseEnter={() => setHoveredHref(resultsItem.href)}
              onMouseLeave={() => setHoveredHref(null)}
              className="flex items-center relative z-10 w-full h-7 md:h-8 lg:h-10 xl:h-[50px] min-h-[28px] md:min-h-[32px] lg:min-h-[40px] xl:min-h-[50px]"
              title={resultsItem.label}
            >
              <div
                className={cn(
                  "flex items-center justify-center shrink-0",
                  "w-[64px] md:w-[72px] lg:w-[88px] xl:w-[100px]",
                )}
              >
                <img
                  src={resultsItem.icon}
                  alt={resultsItem.label}
                  className="w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-[48px] xl:h-[48px]"
                />
              </div>
              <span
                className={cn(
                  "text-white text-sm md:text-base lg:text-lg xl:text-[28px] font-display leading-tight whitespace-nowrap overflow-hidden",
                  "transition-[max-width,opacity] duration-300 ease-out",
                  pathname === resultsItem.href ? "font-bold" : "font-normal",
                  "max-w-0 opacity-0 group-hover:max-w-[170px] md:group-hover:max-w-[185px] lg:group-hover:max-w-[200px] xl:group-hover:max-w-[240px] group-hover:opacity-100",
                )}
              >
                {resultsItem.label}
              </span>
            </Link>
          </div>
        </div>

        {/* Settings section with divider */}
        <div className="shrink-0 w-full flex flex-col gap-1 md:gap-2 lg:gap-3 xl:gap-[32px]">
          {/* Divider above settings */}
          <div className="h-0 border-t border-white/20 shrink-0 ml-4 lg:ml-5 w-8 md:w-10 lg:w-12 xl:w-[60px] group-hover:w-[200px] md:group-hover:w-[220px] lg:group-hover:w-[250px] xl:group-hover:w-[290px] transition-[width] duration-300" />

          {/* Settings item */}
          <div className="relative group/item">
            <div 
              className={cn(
                "absolute -left-[1px] top-[-4px] md:top-[-6px] lg:top-[-8px] xl:top-[-12px] h-8 md:h-9 lg:h-10 xl:h-[75px] w-full pointer-events-none",
                "transition-opacity ease-out",
                hoveredHref === settingsItem.href 
                  ? "opacity-100 duration-75"
                  : "opacity-0 duration-500 delay-100"
              )}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent">
                <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent" />
            </div>

            <Link
              to={settingsItem.href}
              onClick={(e) => handleItemClick(e, settingsItem)}
              onMouseEnter={() => setHoveredHref(settingsItem.href)}
              onMouseLeave={() => setHoveredHref(null)}
              className="flex items-center relative z-10 w-full h-7 md:h-8 lg:h-10 xl:h-[50px] min-h-[28px] md:min-h-[32px] lg:min-h-[40px] xl:min-h-[50px]"
              title={settingsItem.label}
            >
              <div
                className={cn(
                  "flex items-center justify-center shrink-0",
                  "w-[64px] md:w-[72px] lg:w-[88px] xl:w-[100px]",
                )}
              >
                <img
                  src={settingsItem.icon}
                  alt={settingsItem.label}
                  className="w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-[48px] xl:h-[48px]"
                />
              </div>
              <span
                className={cn(
                  "text-white text-sm md:text-base lg:text-lg xl:text-[28px] font-display leading-tight whitespace-nowrap overflow-hidden",
                  "transition-[max-width,opacity] duration-300 ease-out",
                  pathname === settingsItem.href ? "font-bold" : "font-normal",
                  "max-w-0 opacity-0 group-hover:max-w-[170px] md:group-hover:max-w-[185px] lg:group-hover:max-w-[200px] xl:group-hover:max-w-[240px] group-hover:opacity-100",
                )}
              >
                {settingsItem.label}
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 bg-bg-secondary border-t border-border-primary z-[100] pb-safe"
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        <div className="flex items-center overflow-x-auto px-2 py-3 gap-1">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;
            const isSaveButton = item.href === "/save";

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleItemClick(e, item)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 transition-colors flex-shrink-0 min-w-[70px] relative",
                  isActive ? "bg-accent-500/10" : "",
                )}
              >
                <div className="relative">
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
                  {/* Pending changes indicator for mobile */}
                  {isSaveButton && hasChanges && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#1175d5] animate-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] font-medium uppercase tracking-tighter text-center",
                    isActive ? "text-accent-500" : "text-text-tertiary",
                  )}
                >
                  {isSaveButton && isSaving ? "Saving..." : item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
