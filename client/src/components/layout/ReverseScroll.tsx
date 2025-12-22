import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function ReverseScroll() {
  const { scrollYProgress } = useScroll();
  const [pageHeight, setPageHeight] = useState(0);

  // Smooth out the scroll progress
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Transform progress: Start from bottom (0%) to top (100%)
  // We'll use this for the "fill" effect
  
  useEffect(() => {
    // Update height on resize
    const updateHeight = () => {
      setPageHeight(document.documentElement.scrollHeight - window.innerHeight);
    };
    
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <>
      {/* Container Track - Left Side */}
      <div className="fixed left-8 bottom-8 top-32 w-[1px] bg-solo-rule z-40 hidden md:block">
        {/* The "Reverse" Indicator - Fills from bottom up */}
        <motion.div 
          style={{ scaleY, originY: 1 }}
          className="absolute bottom-0 left-0 w-[2px] bg-solo-accent h-full -ml-[0.5px]"
        />
        
        {/* Moving Dot - Moves UP as you scroll DOWN */}
        <motion.div 
          style={{ 
             bottom: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
          }}
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-solo-accent rounded-full -mb-1"
        >
          <div className="absolute inset-0 bg-solo-accent animate-ping opacity-50 rounded-full" />
        </motion.div>
      </div>

      {/* Percentage Counter that moves with the scroll dot */}
      <motion.div
         className="fixed left-12 z-40 font-mono text-xs text-solo-accent hidden md:flex items-center gap-2"
         style={{
            bottom: useTransform(scrollYProgress, [0, 1], ["2rem", "calc(100vh - 9rem)"]),
         }}
      >
         <span className="w-8 h-[1px] bg-solo-accent/50" />
         <ScrollPercentage />
      </motion.div>
    </>
  );
}

function ScrollPercentage() {
  const { scrollYProgress } = useScroll();
  const percent = useTransform(scrollYProgress, (v) => Math.round(v * 100).toString().padStart(3, '0'));

  return (
    <motion.span>{percent}</motion.span>
  );
}
