import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, X } from "lucide-react";

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  className?: string;
  showClearButton?: boolean;
  showSearchButton?: boolean;
}

const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  ({ 
    placeholder = "Search...", 
    value, 
    onChange, 
    onSearch,
    onClear,
    className, 
    showClearButton = true,
    showSearchButton = false,
    ...props 
  }, ref) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        onSearch?.(value);
      }
    };

    const handleClear = () => {
      onChange("");
      onClear?.();
    };

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center space-x-2", className)}
        {...props}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
          />
          {showClearButton && value && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showSearchButton && (
          <Button onClick={() => onSearch?.(value)}>
            Search
          </Button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
