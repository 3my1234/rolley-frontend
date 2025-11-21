import * as React from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface LanguageSelectorProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const LanguageSelector = React.forwardRef<HTMLButtonElement, LanguageSelectorProps>(
  ({ languages, currentLanguage, onLanguageChange, className, ...props }, ref) => {
    const currentLang = languages.find(lang => lang.code === currentLanguage);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="sm"
            className={cn("h-9 w-9", className)}
            {...props}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className="flex items-center space-x-2"
            >
              <span className="text-lg">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              {language.code === currentLanguage && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

LanguageSelector.displayName = "LanguageSelector";

export { LanguageSelector };
