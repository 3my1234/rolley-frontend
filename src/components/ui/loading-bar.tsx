import * as React from "react";
import { cn } from "../../lib/utils";

export interface LoadingBarProps {
  progress?: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}

const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  ({ 
    progress = 0, 
    className, 
    showPercentage = false,
    animated = false,
    color = "primary",
    ...props 
  }, ref) => {
    const colorClasses = {
      primary: "bg-primary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
    };

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        <div className="flex items-center justify-between mb-1">
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          )}
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out",
              colorClasses[color],
              animated && "animate-pulse"
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    );
  }
);

LoadingBar.displayName = "LoadingBar";

export { LoadingBar };
