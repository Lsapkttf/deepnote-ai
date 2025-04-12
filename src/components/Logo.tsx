
import React from "react";
import { Mic } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  variant?: "default" | "sidebar";
}

const Logo = ({ size = "md", withText = true, variant = "default" }: LogoProps) => {
  const sizes = {
    sm: { icon: 16, text: "text-sm" },
    md: { icon: 24, text: "text-xl" },
    lg: { icon: 32, text: "text-2xl" },
  };

  return (
    <div className={`flex items-center gap-2 ${variant === "sidebar" ? "justify-center" : ""}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 blur-sm opacity-70 rounded-full" />
        <div className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 p-1.5 shadow-lg">
          <Mic
            className="text-white"
            size={sizes[size].icon}
            strokeWidth={2.5}
          />
        </div>
      </div>
      {withText && (
        <span className={`font-bold ${sizes[size].text} bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400`}>
          DeepNote
        </span>
      )}
    </div>
  );
};

export default Logo;
