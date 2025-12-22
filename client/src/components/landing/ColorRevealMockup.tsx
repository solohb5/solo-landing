import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import generatedImage from "@assets/generated_images/browser_mockup_for_executive_coach_website.png";

export function ColorRevealMockup() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Interactive Mockup */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[16/10] bg-[#0A0A0A] rounded-sm overflow-hidden cursor-crosshair group shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Color Layer (Base) - We'll reveal this one */}
        <div className="absolute inset-0 w-full h-full">
           <img 
            src={generatedImage} 
            alt="Jovanny Jones Site" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Grayscale Layer (Top) - Masked to show color underneath */}
        <div 
          className="absolute inset-0 w-full h-full bg-[#0A0A0A]"
          style={{
            backgroundImage: `url(${generatedImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) brightness(0.9) contrast(1.1)',
            maskImage: isHovering 
              ? `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, transparent 199px, black 200px)`
              : 'linear-gradient(to bottom, black, black)',
            WebkitMaskImage: isHovering 
              ? `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, transparent 199px, black 200px)`
              : 'linear-gradient(to bottom, black, black)',
            transition: 'mask-image 0s, -webkit-mask-image 0s' // Instant update for cursor feel
          }}
        />
        
        {/* Hint text that fades out on hover */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-white/30 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            Explore
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-4">
        <h3 className="font-body text-sm font-medium tracking-widest text-solo-text uppercase">
          Jovanny Jones <span className="text-solo-text-muted mx-2">—</span> Executive Coach
        </h3>
        <p className="font-display text-2xl md:text-3xl italic text-solo-text opacity-80">
          "I finally have a site that matches my work."
        </p>
      </div>
    </div>
  );
}
