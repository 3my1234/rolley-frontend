import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

export interface BlogCardProps {
  title: string;
  description: string;
  author: string;
  date: string;
  image?: string;
  tags?: string[];
  readTime?: string;
  className?: string;
  onReadMore?: () => void;
}

const BlogCard = React.forwardRef<HTMLDivElement, BlogCardProps>(
  ({ 
    title, 
    description, 
    author, 
    date, 
    image, 
    tags = [], 
    readTime,
    className, 
    onReadMore,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("h-full overflow-hidden", className)}
        {...props}
      >
        {image && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <User className="h-4 w-4" />
            <span>{author}</span>
            <span>•</span>
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
            {readTime && (
              <>
                <span>•</span>
                <span>{readTime}</span>
              </>
            )}
          </div>
          <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-3">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {onReadMore && (
            <Button variant="ghost" className="w-full" onClick={onReadMore}>
              Read More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
);

BlogCard.displayName = "BlogCard";

export { BlogCard };
