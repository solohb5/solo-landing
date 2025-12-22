import { useState, useEffect } from "react";
import Lenis from "lenis";
import { Hero } from "@/components/landing/Hero";
import { ContentSection } from "@/components/landing/ContentSection";
import { ProofSection } from "@/components/landing/ProofSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Preloader } from "@/components/ui/Preloader";
import { FixedOverlay } from "@/components/layout/FixedOverlay";
import { ProjectModal } from "@/components/layout/ProjectModal";
import { Marquee } from "@/components/landing/Marquee";
import { motion } from "framer-motion";

import { SpotlightText } from "@/components/landing/SpotlightText";
import { StrikethroughReveal } from "@/components/ui/StrikethroughReveal";
import { useInView, useIsTouchDevice } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const isTouch = useIsTouchDevice();
  const { ref: workRef, isInView: workInView } = useInView<HTMLDivElement>({ 
    threshold: 0.3,
    triggerOnce: true 
  });

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="w-full min-h-screen bg-solo-bg text-solo-text selection:bg-solo-accent selection:text-solo-bg overflow-x-hidden cursor-none transition-colors duration-800">
      <CustomCursor />
      <Preloader />
      <FixedOverlay onOpenProject={() => setIsProjectModalOpen(true)} />
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      
      <div className="bg-noise" />
      
      <Hero />
      
      <ContentSection number="01">
        <div className="flex flex-col gap-12 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full"
          >
            <SpotlightText className="font-body font-extrabold text-[7vw] leading-[0.9] text-solo-text tracking-tight uppercase">
              You are the brand.
            </SpotlightText>
          </motion.div>

          <div className="flex flex-col gap-6 max-w-3xl">
             <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="font-body text-lg md:text-2xl text-solo-text-muted leading-snug"
             >
               For speakers, coaches, and creators, there's no logo to hide behind. Your audience follows YOU. They buy from YOU. They trust your face, your voice, your story.
             </motion.p>
             
             <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.5, duration: 0.8 }}
               className="font-body text-lg md:text-2xl text-solo-accent leading-snug italic"
             >
               Your website should work the same way.
             </motion.p>
          </div>
        </div>
      </ContentSection>

      {/* Section 02 - Custom Layout */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-8 md:gap-12">
           {/* Number */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="font-display italic font-light text-[64px] md:text-[120px] leading-none text-solo-accent"
           >
             02
           </motion.div>

           {/* Content - Strikethrough reveals (hover on desktop, scroll on mobile) */}
           <div className="flex flex-col gap-0 opacity-80">
             <StrikethroughReveal delay={0.3}>
               Not a template.
             </StrikethroughReveal>

             <StrikethroughReveal delay={0.4}>
               Not a funnel.
             </StrikethroughReveal>

             <StrikethroughReveal delay={0.5}>
               Not like everyone else.
             </StrikethroughReveal>
           </div>

           {/* Final Headline */}
           <motion.h2 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="font-body font-bold text-[6vw] md:text-[6vw] leading-[0.9] text-solo-text uppercase tracking-tighter hover:text-solo-accent transition-colors duration-300 cursor-default"
           >
             Custom used to mean $20K. <br className="hidden md:block"/> Not anymore.
           </motion.h2>

           {/* Horizontal Rule */}
           <motion.div 
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1px] w-full bg-solo-rule mt-4 md:mt-8"
           />
        </div>
      </section>

      {/* Section 03 - The Process */}
      <section className="pt-20 md:pt-32 pb-8 md:pb-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-6 md:gap-10">
          {/* Number */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display italic font-light text-[64px] md:text-[120px] leading-none text-solo-accent"
          >
            03
          </motion.div>

          {/* Main Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body font-extrabold text-[12vw] md:text-[9vw] leading-[0.85] text-solo-text uppercase tracking-tight"
          >
            With one conversation.
          </motion.h2>

          {/* Stacked Details */}
          <div className="flex flex-col gap-1 md:gap-2 max-w-2xl mt-4 md:mt-6">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-body text-xl md:text-3xl text-solo-text-muted"
            >
              We learn how you talk.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-body text-xl md:text-3xl text-solo-text-muted"
            >
              What you've built.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="font-body text-xl md:text-3xl text-solo-text-muted"
            >
              What makes you different.
            </motion.p>
          </div>
        </div>
      </section>

      {/* The Big Reveal - Separate section for drama */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="group cursor-pointer"
        >
          <h2 className="font-display font-light text-[14vw] md:text-[12vw] leading-[0.8] uppercase tracking-tight work-hollow">
            Then we go
          </h2>
          <h2 
            className="font-display font-light text-[14vw] md:text-[12vw] leading-[0.8] uppercase tracking-tight work-hollow"
            style={{ transitionDelay: "0.1s" }}
          >
            to work.
          </h2>
        </motion.div>
        
        {/* Horizontal Rule */}
        <motion.div 
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] w-full bg-solo-rule mt-12 md:mt-20"
        />
      </section>

      <ProofSection />
      
      <CTASection onOpenProject={() => setIsProjectModalOpen(true)} />
      
      <Footer />
    </main>
  );
}
