
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  // Récupérer le thème actuel depuis localStorage ou le thème système
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      return savedTheme === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Appliquer le thème au chargement du composant
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  // Fonction pour appliquer le thème
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", dark.toString());
  };

  // Basculer entre les modes clair et sombre
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};

export default ThemeToggle;
