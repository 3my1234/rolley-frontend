import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

export interface ThemeToggleProps {
  className?: string;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, ...props }, ref) => {
    const [theme, setTheme] = React.useState<"light" | "dark">(getInitialTheme);

    React.useEffect(() => {
      const root = document.documentElement;
      root.classList.remove(theme === "light" ? "dark" : "light");
      root.classList.add(theme);
      window.localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
      setTheme((current) => (current === "light" ? "dark" : "light"));
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn("h-9 w-9", className)}
        onClick={toggleTheme}
        {...props}
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";

export { ThemeToggle };
