import * as React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCardProps {
  title: string;
  description?: string;
  faqs: FAQItem[];
  className?: string;
}

const FAQCard = React.forwardRef<HTMLDivElement, FAQCardProps>(
  ({ title, description, faqs, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("h-full", className)}
        {...props}
      >
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
  }
);

FAQCard.displayName = "FAQCard";

export { FAQCard };
