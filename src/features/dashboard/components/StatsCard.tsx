import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  href?: string;
}

export function StatsCard({ label, value, href }: StatsCardProps) {
  const content = (
    <div className="flex flex-col h-full justify-between relative z-10">
      <h3 className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg 2xl:text-[25px] font-normal text-white font-display leading-tight truncate">
        {label}
      </h3>

      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-[56px] font-normal text-white font-mono flex items-center gap-1 sm:gap-1.5 md:gap-2 mt-auto leading-none transition-transform duration-500 ease-out group-hover:scale-[1.25] origin-bottom-left">
        <span className="text-white/20">|</span>
        <span>{value}</span>
      </p>
    </div>
  );

  const className = cn(
    "group flex flex-col justify-between border-2 border-border-secondary cursor-pointer relative overflow-hidden",
    "bg-bg-primary",
    "before:absolute before:inset-0 before:bg-gradient-to-b before:from-[rgba(17,117,213,0.5)] before:via-40% before:via-[#181818] before:to-[#121212]",
    "before:opacity-0 before:transition-opacity before:duration-500 before:ease-out",
    "hover:before:opacity-100",
    "w-full",
    "h-[100px] sm:h-[120px] md:h-[130px] lg:h-[140px] xl:h-[160px] 2xl:h-[175px]",
    "p-3 sm:p-3 md:p-3 lg:p-[12px]",
  );

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
