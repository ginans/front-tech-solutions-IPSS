import { cn } from "@/lib/utils";

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn("min-h-5 text-sm font-medium text-destructive", className)}
    >
      {message ?? ""}
    </p>
  );
}