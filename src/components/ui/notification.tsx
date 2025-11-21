import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";

export interface NotificationProps {
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ title, description, type = "info", onClose, className, children, ...props }, ref) => {
    const typeStyles = {
      success: "border-green-200 bg-green-50 text-green-900",
      error: "border-red-200 bg-red-50 text-red-900",
      warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
      info: "border-blue-200 bg-blue-50 text-blue-900",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border p-4 shadow-sm",
          typeStyles[type],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
            {children}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

Notification.displayName = "Notification";

export { Notification };
