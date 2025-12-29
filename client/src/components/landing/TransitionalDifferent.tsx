import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function TransitionalDifferent() {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: true
  });

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center"
      >
        <h2
          className={cn(
            "font-display italic font-light text-[18vw] md:text-[14vw] leading-[0.85] tracking-tight different-shimmer select-none",
            isInView && "revealed"
          )}
        >
          Different.
        </h2>
      </motion.div>
    </section>
  );
}
