import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const duration = 1500; // Faster duration (1.5s)
    const steps = 100;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-solo-bg p-8 md:p-12"
        >
          {/* Top Logo */}
          <div className="w-full flex justify-between items-start opacity-0 animate-in fade-in duration-700">
             <div className="flex items-center gap-2">
                <span className="font-display font-medium tracking-wide text-2xl text-solo-text leading-none">SOLO</span>
                <div className="w-2 h-2 bg-solo-accent animate-heartbeat" />
             </div>
             <div className="font-mono text-xs uppercase tracking-widest text-solo-text-muted">
                Portfolio 2025
             </div>
          </div>

          {/* Large Counter Center */}
          <div className="flex flex-col items-center justify-center relative">
             <motion.div 
               className="font-display font-light text-[20vw] md:text-[15vw] leading-none text-solo-text tabular-nums tracking-tighter"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
             >
                {count.toString().padStart(3, '0')}
             </motion.div>
          </div>

          {/* Bottom Text */}
          <div className="w-full flex justify-between items-end opacity-0 animate-in fade-in duration-700 delay-100">
             <div className="hidden md:block font-body text-xs text-solo-text-muted max-w-xs uppercase tracking-wide">
                Premium websites for personal brands.
             </div>
             <div className="font-body text-xs text-solo-text-muted uppercase tracking-wide">
                Loading Experience
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
