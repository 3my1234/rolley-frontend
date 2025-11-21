import * as React from "react";
import { cn } from "../../lib/utils";
import { Skeleton } from "../../components/ui/skeleton";

export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
  showImage?: boolean;
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ 
    className, 
    lines = 3, 
    showAvatar = false, 
    showButton = false,
    showImage = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-3", className)}
        {...props}
      >
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        )}
        
        {showImage && (
          <Skeleton className="h-48 w-full rounded-lg" />
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "h-4",
                i === lines - 1 ? "w-3/4" : "w-full"
              )} 
            />
          ))}
        </div>
        
        {showButton && (
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        )}
      </div>
    );
  }
);

LoadingSkeleton.displayName = "LoadingSkeleton";

export { LoadingSkeleton };
