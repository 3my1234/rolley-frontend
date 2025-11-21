import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { LucideIcon } from "lucide-react";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon: Icon, className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("h-full", className)}
        {...props}
      >
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
          {children}
        </CardContent>
      </Card>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard };
