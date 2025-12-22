import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "../landing/Logo";
import { cn } from "@/lib/utils";

type Theme = "gold" | "electric" | "deep" | "inverted";

interface FixedOverlayProps {
  onOpenProject: () => void;
}

export function FixedOverlay({ onOpenProject }: FixedOverlayProps) {
  const [theme, setTheme] = useState<Theme>("gold");
  const [rotation, setRotation] = useState(0);
  const { scrollY } = useScroll();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Transform opacity based on scroll position - start fading immediately, gone by 100px
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  // Transform pointer-events to prevent interaction when faded out
  const pointerEvents = useTransform(scrollY, (value) => value > 100 ? "none" : "auto");

  const themes: Theme[] = ["gold", "electric", "deep", "inverted"];

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setTheme(nextTheme);
    setRotation(prev => prev + 90);
    
    // Update DOM
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const getStyleFor = (id: string) => {
    const isHovered = hoveredId === id;
    const isDimmed = hoveredId !== null && !isHovered;

    return {
      opacity: isDimmed ? 0.2 : 1,
      filter: isHovered ? "drop-shadow(0 0 8px var(--color-solo-accent))" : "none",
      transition: "opacity 0.3s ease, filter 0.3s ease, color 0.3s ease, transform 0.3s ease",
      color: isHovered ? "var(--color-solo-accent)" : undefined,
      transform: isHovered ? "scale(1.1)" : "scale(1)",
    };
  };

  return (
    <>
      
      {/* Dimmer Overlay - Covers everything when ANY item is hovered */}
      <motion.div 
        className="fixed inset-0 bg-black pointer-events-none z-[45]" 
        initial={{ opacity: 0 }}
        animate={{ opacity: hoveredId ? 0.8 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Scroll-away Elements Group */}
      <motion.div style={{ opacity, pointerEvents }}>
        {/* Top Left: Pulsing Square (Theme Switcher) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
          onClick={toggleTheme}
          onMouseEnter={() => setHoveredId('theme-switcher')}
          onMouseLeave={() => setHoveredId(null)}
          className="fixed top-8 left-8 z-50 group cursor-pointer"
          whileTap={{ scale: 0.9 }}
          style={getStyleFor('theme-switcher')}
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-6 h-6 bg-solo-accent animate-heartbeat"
          />
        </motion.button>

        
        {/* Bottom Right: Logo with pulsing square */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.0, duration: 1 }}
          className="fixed bottom-8 right-8 z-50 pointer-events-none flex items-center gap-2"
        >
           <span 
             className="font-display font-medium text-2xl md:text-3xl tracking-wide leading-none"
             style={{ color: 'var(--color-solo-text)' }}
           >
             SOLO
           </span>
           <div 
             className="w-5 h-5 md:w-6 md:h-6 bg-solo-accent animate-heartbeat"
           />
        </motion.div>

        {/* Page Border */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="fixed inset-3 md:inset-5 border border-solo-rule z-[40] pointer-events-none"
        />
      </motion.div>

      {/* Top Right: Let's build - PERMANENT (Outside opacity group) */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.8, duration: 1 }}
        onClick={onOpenProject}
        onMouseEnter={() => setHoveredId('lets-build')}
        onMouseLeave={() => setHoveredId(null)}
        className="fixed top-8 right-8 z-50 cursor-pointer group"
        style={getStyleFor('lets-build')}
      >
        <span className="font-display text-lg tracking-wide text-solo-text transition-colors"
           style={{ 
             color: hoveredId === 'lets-build' ? 'var(--color-solo-accent)' : undefined,
             textShadow: hoveredId === 'lets-build' ? "0 0 30px var(--color-solo-accent), 0 0 60px var(--color-solo-accent)" : "none",
           }}
        >
          [ let's build ]
        </span>
      </motion.button>
    </>
  );
}
