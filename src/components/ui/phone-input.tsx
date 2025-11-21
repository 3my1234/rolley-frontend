import * as React from "react";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, countryCode = "+1", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Remove any non-digit characters
      const cleanedValue = inputValue.replace(/\D/g, "");
      onChange(cleanedValue);
    };

    const formatPhoneNumber = (phoneNumber: string) => {
      if (phoneNumber.length === 0) return "";
      if (phoneNumber.length <= 3) return phoneNumber;
      if (phoneNumber.length <= 6) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
      }
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    return (
      <div className="flex">
        <div className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          {countryCode}
        </div>
        <Input
          ref={ref}
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handleChange}
          placeholder="(555) 123-4567"
          className={cn("rounded-l-none", className)}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
