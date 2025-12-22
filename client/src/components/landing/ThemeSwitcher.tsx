import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Square } from "./Logo";

type Theme = "default" | "green" | "blue" | "cream";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("default");
  const [rotation, setRotation] = useState(0);

  const themes: Theme[] = ["default", "green", "blue", "cream"];

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setTheme(nextTheme);
    setRotation(prev => prev + 90);
    
    // Update DOM
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-50 group mix-blend-difference cursor-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-4 h-4 bg-solo-accent relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-solo-accent opacity-50 blur-sm animate-pulse" />
      </motion.div>
    </motion.button>
  );
}
