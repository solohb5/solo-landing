import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectModal } from "../layout/ProjectModal";

export function ProofSection() {
  const ref = useRef(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  return (
    <>
      <section ref={ref} className="py-24 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
         <motion.div  
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="font-display italic font-light text-[64px] md:text-[120px] leading-none text-solo-accent mb-6 md:mb-10"
         >
           04
         </motion.div>
         
         <motion.h2 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="font-body font-extrabold text-[8vw] md:text-[8vw] leading-[0.9] text-solo-text uppercase tracking-tight mb-12 md:mb-16"
         >
           our work
         </motion.h2>

         <div className="w-full -mx-6 md:mx-0">
           <motion.div
             initial={{ opacity: 0, x: 100 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.2 }}
           >
             <ProjectGallery onOpenProject={() => setIsProjectModalOpen(true)} />
           </motion.div>
         </div>
         
         {/* Testimonial */}
         <div className="border-t border-solo-rule pt-8 md:pt-12 mt-12 md:mt-16 flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start">
            <div className="flex flex-col gap-2">
               <span className="font-body text-xs uppercase tracking-widest text-solo-text-muted">Client</span>
               <span className="font-body text-lg text-solo-text">Jovanny Jones</span>
            </div>
            <blockquote className="font-display text-2xl md:text-4xl italic text-solo-text opacity-90 leading-tight max-w-2xl">
              "For the first time, my site feels like me."
            </blockquote>
         </div>
      </section>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </>
  );
}
