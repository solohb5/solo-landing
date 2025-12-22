import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  number: string;
  children: React.ReactNode;
  className?: string;
  noRule?: boolean;
}

export function ContentSection({ number, children, className, noRule = false }: ContentSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className={cn("py-12 md:py-20 px-6 md:px-12 max-w-[1400px] mx-auto", className)}>
      <div className="flex flex-col gap-8 md:gap-12">
        {/* Number */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display italic font-light text-[64px] md:text-[120px] leading-none text-solo-accent"
        >
          {number}
        </motion.div>
        
        {/* Content */}
        <div className="flex flex-col gap-8">
           {children}
        </div>
        
        {/* Horizontal Rule */}
        {!noRule && (
          <motion.div 
             initial={{ scaleX: 0, originX: 0 }}
             animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
             transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="h-[1px] w-full bg-solo-rule mt-8 md:mt-16"
          />
        )}
      </div>
    </section>
  );
}
