import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CTASectionProps {
  onOpenProject: () => void;
}

export function CTASection({ onOpenProject }: CTASectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div onClick={onOpenProject} className="block group cursor-pointer">
        <div className="flex flex-col gap-4">
          {/* Number */}
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-display italic font-light text-[64px] md:text-[120px] leading-none text-solo-accent mb-4 md:mb-8"
          >
            05
          </motion.span>
          
          {/* Text Stack */}
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 0.5, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-body font-bold text-[12vw] leading-[0.85] text-solo-text uppercase tracking-tighter transition-all duration-300 group-hover:italic group-hover:tracking-normal group-hover:opacity-80"
          >
            Let's build
          </motion.h2>
          
          <div className="flex items-center gap-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-body font-bold text-[12vw] leading-[0.85] text-solo-text uppercase tracking-tighter transition-all duration-300 group-hover:italic group-hover:text-solo-accent"
            >
              Let's build
            </motion.h2>
            
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-[8vw] text-solo-text transition-transform duration-300 group-hover:translate-x-12 group-hover:text-solo-accent"
            >
              →
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}
