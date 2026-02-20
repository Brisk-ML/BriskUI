import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HoverSelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface HoverSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: HoverSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function HoverSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName,
  disabled = false,
}: HoverSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay to allow moving to dropdown
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Close on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
          "transition-colors outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-white/60")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && position && (
        <div
          ref={dropdownRef}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
          className="fixed z-50 overflow-hidden rounded-md border border-[#404040] bg-[#282828] shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            top: position.top,
            left: position.left,
            minWidth: position.width,
          }}
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => !option.disabled && handleSelect(option.value)}
                className={cn(
                  "relative flex w-full items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm text-white outline-none select-none",
                  "transition-all duration-200",
                  option.disabled
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover-select-item",
                  value === option.value && "font-medium",
                )}
              >
                {/* Blue gradient hover effect - fades in from right */}
                <span className="hover-select-gradient absolute inset-0 rounded-sm opacity-0 transition-opacity duration-200" />
                
                <span className="relative z-10 truncate">{option.label}</span>
                
                {value === option.value && (
                  <span className="absolute right-2 z-10">
                    <CheckIcon className="size-4 text-[#1175d5]" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
