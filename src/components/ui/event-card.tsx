import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

export interface EventCardProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  image?: string;
  attendees?: number;
  maxAttendees?: number;
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
  className?: string;
  onRegister?: () => void;
  onViewDetails?: () => void;
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ 
    title, 
    description, 
    date, 
    time, 
    location, 
    image, 
    attendees = 0,
    maxAttendees,
    status = "upcoming",
    className, 
    onRegister,
    onViewDetails,
    ...props 
  }, ref) => {
    const statusColors = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const isFull = maxAttendees && attendees >= maxAttendees;

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
          <div className="flex items-center justify-between mb-2">
            <Badge className={statusColors[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {isFull && (
              <Badge variant="destructive">Full</Badge>
            )}
          </div>
          <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-3">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
            {location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {attendees}
                {maxAttendees && ` / ${maxAttendees}`} attendees
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {onRegister && status === "upcoming" && !isFull && (
              <Button className="flex-1" onClick={onRegister}>
                Register
              </Button>
            )}
            {onViewDetails && (
              <Button variant="outline" className="flex-1" onClick={onViewDetails}>
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

EventCard.displayName = "EventCard";

export { EventCard };
