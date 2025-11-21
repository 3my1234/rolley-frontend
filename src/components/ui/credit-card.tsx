import * as React from "react";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";

export interface CreditCardProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const CreditCard = React.forwardRef<HTMLInputElement, CreditCardProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Remove any non-digit characters
      const cleanedValue = inputValue.replace(/\D/g, "");
      onChange(cleanedValue);
    };

    const formatCardNumber = (cardNumber: string) => {
      if (cardNumber.length === 0) return "";
      const groups = cardNumber.match(/.{1,4}/g) || [];
      return groups.join(" ");
    };

    const getCardType = (cardNumber: string) => {
      if (cardNumber.startsWith("4")) return "visa";
      if (cardNumber.startsWith("5")) return "mastercard";
      if (cardNumber.startsWith("3")) return "amex";
      return "unknown";
    };

    const cardType = getCardType(value);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={formatCardNumber(value)}
          onChange={handleChange}
          placeholder="1234 5678 9012 3456"
          maxLength={19} // 16 digits + 3 spaces
          className={cn("pr-10", className)}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {cardType === "visa" && (
            <div className="h-4 w-6 rounded bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
              V
            </div>
          )}
          {cardType === "mastercard" && (
            <div className="h-4 w-6 rounded bg-red-600 text-white text-xs flex items-center justify-center font-bold">
              M
            </div>
          )}
          {cardType === "amex" && (
            <div className="h-4 w-6 rounded bg-green-600 text-white text-xs flex items-center justify-center font-bold">
              A
            </div>
          )}
        </div>
      </div>
    );
  }
);

CreditCard.displayName = "CreditCard";

export { CreditCard };
