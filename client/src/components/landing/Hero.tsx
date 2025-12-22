import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Square } from "./Logo";
import { Marquee } from "./Marquee";
import { useInView, useIsTouchDevice } from "@/hooks/useInView";

export function Hero() {
  const isTouch = useIsTouchDevice();
  const { ref: storyRef, isInView: storyInView } = useInView<HTMLSpanElement>({ 
    threshold: 0.5,
    triggerOnce: true 
  });

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center py-12 relative overflow-hidden">
      
      {/* Corner Marquee */}
      <div className="absolute -bottom-24 -right-24 md:-bottom-32 md:-right-32 z-20 origin-bottom-right rotate-[-45deg] pointer-events-none select-none mix-blend-plus-lighter opacity-50">
        <Marquee />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center z-10 w-full px-6 md:px-12 relative text-left">
        <div className="w-full max-w-[1400px] mx-auto">
          
          {/* We Build */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 2.8 }}
            className="overflow-hidden"
          >
            <h1 className="font-body font-extrabold text-[11vw] leading-[0.8] tracking-tight text-solo-text block uppercase">
              We build
            </h1>
          </motion.div>
          
          {/* Websites */}
          <div className="overflow-hidden">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 2.9 }}
              className="font-body font-extrabold text-[11vw] leading-[0.8] tracking-tight text-solo-text block uppercase"
            >
              Websites
            </motion.h1>
          </div>
          
          {/* That Tell */}
          <div className="overflow-hidden">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 3.0 }}
              className="font-body font-extrabold text-[11vw] leading-[0.8] tracking-tight text-solo-text block uppercase"
            >
              That tell
            </motion.h1>
          </div>
          
          {/* Your Story + Square */}
          <div className="overflow-hidden flex items-baseline gap-4 md:gap-8">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 3.1 }}
              className="font-body font-extrabold text-[11vw] leading-[0.8] tracking-tight text-solo-text block uppercase flex items-baseline gap-[2vw]"
            >
              <span>Your</span>
              <span 
                ref={storyRef}
                className={cn(
                  "story-hollow relative inline-block font-display italic font-light",
                  !isTouch && "cursor-pointer",
                  isTouch && storyInView && "story-revealed"
                )}
              >
                Story
              </span>
            </motion.h1>
            
            {/* Pulsing Square Inline */}
            <motion.div
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 2.2 }}
               className="mb-[1.5vw]"
            >
               <div className="w-[3.5vw] h-[3.5vw] bg-solo-accent animate-heartbeat" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
