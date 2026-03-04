import { useRef, useCallback } from "react";

interface TrainTestSliderProps {
  testSize: number;
  onChange: (testSize: number) => void;
  className?: string;
}

export function TrainTestSlider({ testSize, onChange, className }: TrainTestSliderProps) {
  const trainPercent = Math.round((1 - testSize) * 100);
  const testPercent = 100 - trainPercent;
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const trainRatio = Math.max(0.05, Math.min(0.95, ratio));
      const newTestSize = Math.round((1 - trainRatio) * 100) / 100;
      onChange(newTestSize);
    },
    [onChange],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className={className}>
      <div className="flex justify-between mb-1.5">
        <span className="text-white text-sm sm:text-base font-display">Train</span>
        <span className="text-white text-sm sm:text-base font-display">Test</span>
      </div>
      <div
        ref={barRef}
        className="relative h-10 sm:h-12 flex cursor-pointer select-none border border-[#404040]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="bg-[#1175d5] flex items-center justify-center transition-[width] duration-75"
          style={{ width: `${trainPercent}%` }}
        >
          <span className="text-white text-sm sm:text-base lg:text-lg font-display font-semibold">
            {trainPercent}%
          </span>
        </div>
        <div
          className="bg-[#282828] flex items-center justify-center flex-1"
        >
          <span className="text-white text-sm sm:text-base lg:text-lg font-display font-semibold">
            {testPercent}%
          </span>
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white -translate-x-1/2 pointer-events-none"
          style={{ left: `${trainPercent}%` }}
        />
      </div>
    </div>
  );
}
