import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export interface TeamCardProps {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  className?: string;
}

const TeamCard = React.forwardRef<HTMLDivElement, TeamCardProps>(
  ({ name, role, bio, avatar, social, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("h-full", className)}
        {...props}
      >
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-lg">
              {name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription className="text-base">{role}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">{bio}</p>
          {social && (
            <div className="flex justify-center space-x-2">
              {social.github && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={social.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {social.linkedin && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {social.twitter && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {social.email && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`mailto:${social.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

TeamCard.displayName = "TeamCard";

export { TeamCard };
