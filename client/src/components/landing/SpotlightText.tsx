import { useState, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { useInView, useIsTouchDevice } from '@/hooks/useInView';

interface SpotlightTextProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
}

export function SpotlightText({ children, className, spotlightSize = 300 }: SpotlightTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  
  const isTouch = useIsTouchDevice();
  const { ref: inViewRef, isInView } = useInView<HTMLDivElement>({ 
    threshold: 0.3,
    triggerOnce: true 
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || isTouch) return;
    
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setOpacity(1);
  };

  const handleMouseLeave = () => {
    if (!isTouch) setOpacity(0);
  };

  // Combine refs
  const setRefs = (el: HTMLDivElement | null) => {
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  // On touch devices, show filled text when in view
  const mobileRevealed = isTouch && isInView;

  return (
    <div
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative cursor-default select-none group", className)}
    >
      {/* Base Layer - Outline / Ghostly */}
      <div 
        className={cn(
          "text-transparent text-outline select-none pointer-events-none transition-opacity duration-500",
          mobileRevealed ? "opacity-0" : "opacity-30 group-hover:opacity-20"
        )}
      >
        {children}
      </div>

      {/* Reveal Layer - Filled */}
      <div
        className="absolute inset-0 text-solo-text select-none pointer-events-none"
        style={{
          // Desktop: spotlight effect
          ...(!isTouch && {
            maskImage: `radial-gradient(circle ${spotlightSize}px at ${position.x}px ${position.y}px, black, transparent)`,
            WebkitMaskImage: `radial-gradient(circle ${spotlightSize}px at ${position.x}px ${position.y}px, black, transparent)`,
          }),
          opacity: mobileRevealed ? 1 : opacity,
          transition: 'opacity 0.5s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
