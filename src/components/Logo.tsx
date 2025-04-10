
import React from "react";
import { Brain } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const Logo = ({ size = "md", withText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 16, text: "text-sm" },
    md: { icon: 24, text: "text-lg" },
    lg: { icon: 32, text: "text-xl" },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded-full bg-primary p-1">
        <Brain
          className="text-primary-foreground"
          size={sizes[size].icon}
          strokeWidth={2.5}
        />
      </div>
      {withText && (
        <span className={`font-semibold ${sizes[size].text}`}>DeepNote</span>
      )}
    </div>
  );
};

export default Logo;
