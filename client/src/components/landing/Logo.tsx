import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SquareProps {
  className?: string;
  pulsing?: boolean;
  interactive?: boolean;
}

export function Square({ className, pulsing = false, interactive = false }: SquareProps) {
  return (
    <div
      className={cn(
        "w-2 h-2 bg-solo-accent",
        pulsing && "animate-heartbeat",
        interactive && "square-interactive",
        className
      )}
    />
  );
}

interface LogoProps {
  className?: string;
  squareClassName?: string;
  subtext?: string;
  showSubtext?: boolean;
  interactive?: boolean;
  onSquareClick?: () => void;
  rotation?: number;
}

export function Logo({ 
  className, 
  squareClassName,
  subtext, 
  showSubtext = false, 
  interactive = false,
  onSquareClick,
  rotation = 0
}: LogoProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Use actual logo image */}
      <img 
        src="/solo-logo-light.png" 
        alt="Solo Designs" 
        className="h-8 w-auto"
      />
      
      {showSubtext && (
        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-solo-text-muted mt-1 opacity-60 ml-[1px]">
          {subtext || "Designs"}
        </span>
      )}
    </div>
  );
}
