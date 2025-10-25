import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
}) {
  return (
    <button
      className={cn(
        "btn",
        variant === "primary" ? "btn-primary" : "btn-outline",
        className
      )}
      {...props}
    />
  );
}
