"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { ReactNode } from "react";

type KpiCardProps = {
  title:       string;
  value:       string;
  description?: ReactNode;
  icon?:       ReactNode;
  tooltip?:    string;       // explanation shown on hover
  trend?:      ReactNode;    // delta badge slot
  accent?:     "default" | "red" | "yellow" | "green" | "blue";
};

const ACCENT_MAP = {
  default: {
    icon:   "bg-zinc-800 text-zinc-400",
    border: "border-zinc-800",
    glow:   "",
  },
  red: {
    icon:   "bg-red-500/10 text-red-400",
    border: "border-zinc-800 hover:border-red-500/30",
    glow:   "shadow-red-500/5",
  },
  yellow: {
    icon:   "bg-yellow-500/10 text-yellow-400",
    border: "border-zinc-800 hover:border-yellow-500/30",
    glow:   "shadow-yellow-500/5",
  },
  green: {
    icon:   "bg-green-500/10 text-green-400",
    border: "border-zinc-800 hover:border-green-500/30",
    glow:   "shadow-green-500/5",
  },
  blue: {
    icon:   "bg-blue-500/10 text-blue-400",
    border: "border-zinc-800 hover:border-blue-500/30",
    glow:   "shadow-blue-500/5",
  },
};

const KpiCard = ({
  title,
  value,
  description,
  icon,
  tooltip,
  trend,
  accent = "default",
}: KpiCardProps) => {
  const colors = ACCENT_MAP[accent];

  return (
    <div className="flex-1 min-w-0">
      <div
        className={`
          h-full flex flex-col justify-between
          rounded-xl border ${colors.border}
          bg-zinc-900/60 backdrop-blur-sm
          p-5 gap-4
          shadow-lg ${colors.glow}
          transition-all duration-200
          hover:bg-zinc-900/80
        `}
      >
        {/* Top row — icon + tooltip */}
        <div className="flex items-start justify-between gap-2">
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            {icon}
          </div>
          {tooltip && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-zinc-600 hover:text-zinc-400 transition-colors mt-0.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[200px] text-xs bg-zinc-900 border-zinc-700 text-zinc-300"
                >
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Middle — value */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-50">
            {value}
          </p>
        </div>

        {/* Bottom — description / trend */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <div className="text-xs text-zinc-500">{description}</div>
          {trend && <div>{trend}</div>}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;