
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FuturisticButtonProps extends ButtonProps {
  gradient?: boolean;
  glow?: boolean;
}

const FuturisticButton = React.forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ className, gradient = false, glow = false, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-md transition-all duration-200",
          gradient && "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0",
          glow && "shadow-[0_0_15px_rgba(56,189,248,0.5)] hover:shadow-[0_0_25px_rgba(56,189,248,0.7)]",
          "after:content-[''] after:absolute after:h-[200%] after:w-[200%] after:top-[-50%] after:left-[-50%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:opacity-0 after:rotate-45 after:transition-all after:duration-700",
          "hover:after:opacity-100 hover:after:translate-x-[100%]",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FuturisticButton.displayName = "FuturisticButton";

export default FuturisticButton;
