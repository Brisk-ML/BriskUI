import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  href?: string;
}

export function StatsCard({ label, value, href }: StatsCardProps) {
  const content = (
    <div className="flex flex-col h-full justify-between relative z-10 min-h-0">
      <h3 className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg 2xl:text-xl font-normal text-white font-display leading-tight break-words">
        {label}
      </h3>

      <p className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-normal text-white font-mono flex items-center gap-1 sm:gap-1.5 md:gap-2 mt-auto leading-none transition-transform duration-500 ease-out group-hover:scale-[1.2] origin-bottom-left">
        <span className="text-white/20">|</span>
        <span>{value}</span>
      </p>
    </div>
  );

  const className = cn(
    "group flex flex-col justify-between border-2 border-border-secondary cursor-pointer relative overflow-hidden aspect-square min-w-0",
    "bg-bg-primary",
    "before:absolute before:inset-0 before:bg-gradient-to-b before:from-[rgba(17,117,213,0.5)] before:via-[rgba(17,117,213,0.1)] before:via-40% before:to-[#121212]",
    "before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out",
    "hover:before:opacity-100",
    "w-full",
    "p-3 sm:p-4 md:p-4",
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
