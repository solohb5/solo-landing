import { motion } from "framer-motion";
import { useInView, useIsTouchDevice } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface StrikethroughRevealProps {
  children: string;
  delay?: number;
  className?: string;
}

export function StrikethroughReveal({ 
  children, 
  delay = 0,
  className 
}: StrikethroughRevealProps) {
  const isTouch = useIsTouchDevice();
  const { ref, isInView } = useInView<HTMLDivElement>({ 
    threshold: 0.5,
    triggerOnce: true 
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className="group relative w-fit"
    >
      <h2 
        className={cn(
          "font-body font-bold text-[8vw] md:text-[8vw] leading-[0.85] uppercase tracking-tighter transition-all duration-500",
          // Default state: outlined/transparent
          "text-transparent text-outline",
          // Desktop: hover to reveal
          !isTouch && "group-hover:text-solo-text-muted group-hover:line-through decoration-solo-accent decoration-4",
          // Mobile: scroll to reveal
          isTouch && isInView && "text-solo-text-muted line-through decoration-solo-accent decoration-4",
          className
        )}
      >
        {children}
      </h2>
    </motion.div>
  );
}

