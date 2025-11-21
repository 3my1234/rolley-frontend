import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Star } from "lucide-react";

export interface TestimonialCardProps {
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ name, role, company, content, avatar, rating = 5, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("h-full", className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-1 mb-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                )}
              />
            ))}
          </div>
          <blockquote className="text-sm text-muted-foreground mb-4">
            "{content}"
          </blockquote>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>
                {name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-muted-foreground">
                {role}
                {company && ` at ${company}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

TestimonialCard.displayName = "TestimonialCard";

export { TestimonialCard };
