import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Check, X } from "lucide-react";

export interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  limitations?: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  popular?: boolean;
  className?: string;
  onButtonClick?: () => void;
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  ({ 
    title, 
    description, 
    price, 
    period = "month", 
    features, 
    limitations = [], 
    buttonText, 
    buttonVariant = "default",
    popular = false,
    className, 
    onButtonClick,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative h-full",
          popular && "border-primary shadow-lg",
          className
        )}
        {...props}
      >
        {popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground">/{period}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full" 
            variant={popular ? "default" : buttonVariant}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
            {limitations.map((limitation, index) => (
              <div key={index} className="flex items-center space-x-2">
                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{limitation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
);

PricingCard.displayName = "PricingCard";

export { PricingCard };
