import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  details: z.string().min(10, "Tell us a bit more"),
});

/* ============================================
   SIMPLEX NOISE - For organic blob movement
   ============================================ */
class SimplexNoise {
  private perm: number[] = [];
  
  constructor(seed = Math.random()) {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    let n: number;
    let q: number;
    for (let i = 255; i > 0; i--) {
      seed = ((seed * 16807) % 2147483647);
      n = seed % (i + 1);
      q = p[i];
      p[i] = p[n];
      p[n] = q;
    }
    
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }
  
  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    
    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    
    let n0 = 0, n1 = 0, n2 = 0;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const gi0 = this.perm[ii + this.perm[jj]] % 12;
      n0 = t0 * t0 * this.dot2(gi0, x0, y0);
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
      n1 = t1 * t1 * this.dot2(gi1, x1, y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
      n2 = t2 * t2 * this.dot2(gi2, x2, y2);
    }
    
    return 70 * (n0 + n1 + n2);
  }
  
  private dot2(gi: number, x: number, y: number): number {
    const grad = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [1, 0], [-1, 0],
      [0, 1], [0, -1], [0, 1], [0, -1]
    ][gi];
    return grad[0] * x + grad[1] * y;
  }
}

/* ============================================
   MORPHING BLOB - The Signature Visual
   ============================================ */
function MorphingBlob({ mouseX, mouseY, scrollProgress, isCtaHover }: { mouseX: number; mouseY: number; scrollProgress: number; isCtaHover: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simplex = useMemo(() => new SimplexNoise(42), []);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Blue colors - electric blue gradient
    const getColor = (layer: number) => {
      const blueColors = [
        { r: 60, g: 120, b: 255 },   // Layer 0: Deep blue
        { r: 80, g: 160, b: 255 },   // Layer 1: Electric blue
        { r: 120, g: 200, b: 255 },  // Layer 2: Bright blue
        { r: 180, g: 230, b: 255 },  // Layer 3: White-blue core
      ];
      return blueColors[Math.min(layer, blueColors.length - 1)];
    };
    
    const animate = () => {
      timeRef.current += 0.0015;
      const t = timeRef.current;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center point shifts based on mouse and scroll
      const centerX = window.innerWidth * 0.65 + (mouseX - window.innerWidth / 2) * 0.1;
      const centerY = window.innerHeight * 0.45 + (mouseY - window.innerHeight / 2) * 0.08 - scrollProgress * 200;
      
      // Dynamic radius based on scroll
      const baseRadius = Math.min(window.innerWidth, window.innerHeight) * (0.32 + scrollProgress * 0.1);
      
      // Draw multiple layered blobs (original smooth style)
      for (let layer = 0; layer < 4; layer++) {
        const layerOffset = layer * 0.5;
        const layerOpacity = 0.28 - layer * 0.04;
        const layerRadius = baseRadius * (1 - layer * 0.18);
        
        ctx.beginPath();
        
        const points = 120;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          
          // Multiple noise octaves for organic movement
          const noise1 = simplex.noise2D(Math.cos(angle) * 1.5 + t + layerOffset, Math.sin(angle) * 1.5 + t) * 0.3;
          const noise2 = simplex.noise2D(Math.cos(angle) * 3 + t * 0.7, Math.sin(angle) * 3 + t * 0.7) * 0.15;
          const noise3 = simplex.noise2D(Math.cos(angle) * 6 + t * 0.5, Math.sin(angle) * 6 + t * 0.5) * 0.08;
          
          const noiseValue = noise1 + noise2 + noise3;
          const r = layerRadius * (1 + noiseValue);
          
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        
        // Get color based on CTA hover state
        const color = getColor(layer);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, layerRadius * 1.5
        );
        
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 1.2})`);
        gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.8})`);
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Inner core glow - bright blue center
      const coreGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius * 0.35
      );
      coreGlow.addColorStop(0, 'rgba(200, 230, 255, 0.6)');
      coreGlow.addColorStop(0.3, 'rgba(120, 200, 255, 0.4)');
      coreGlow.addColorStop(0.6, 'rgba(80, 160, 255, 0.2)');
      coreGlow.addColorStop(1, 'rgba(60, 120, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mouseX, mouseY, scrollProgress, simplex]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}

/* ============================================
   CUSTOM CURSOR - Enhanced
   ============================================ */
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverElement = target.closest('[data-hover]');
      if (hoverElement) {
        setIsHovering(true);
        setCursorText(hoverElement.getAttribute('data-cursor-text') || "");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-hover]')) {
        setIsHovering(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="hidden lg:flex fixed pointer-events-none z-[9999] items-center justify-center rounded-full"
        style={{ 
          left: cursorXSpring, 
          top: cursorYSpring, 
          x: "-50%", 
          y: "-50%",
          backgroundColor: isHovering ? 'rgba(232, 220, 196, 0.9)' : 'transparent',
          border: isHovering ? 'none' : '1px solid rgba(232, 220, 196, 0.5)',
        }}
        animate={{
          width: isHovering ? 80 : 12,
          height: isHovering ? 80 : 12,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {cursorText && isHovering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] tracking-[0.15em] uppercase font-medium text-black"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}

/* ============================================
   MAGNETIC BUTTON - Enhanced
   ============================================ */
function MagneticButton({ 
  children, 
  onClick, 
  className = "",
  cursorText = "",
  onMouseEnter,
  onMouseLeave
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  cursorText?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { damping: 15, stiffness: 150 });
  const ySpring = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.4);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.4);
  }, [x, y]);

  const handleMouseLeaveInternal = useCallback(() => { 
    x.set(0); 
    y.set(0); 
    onMouseLeave?.();
  }, [x, y, onMouseLeave]);

  const handleMouseEnterInternal = useCallback(() => {
    onMouseEnter?.();
  }, [onMouseEnter]);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnterInternal}
      onMouseLeave={handleMouseLeaveInternal}
      style={{ x: xSpring, y: ySpring }}
      className={className}
      data-hover
      data-cursor-text={cursorText}
    >
      {children}
    </motion.button>
  );
}

/* ============================================
   SPLIT TEXT - For character animations
   ============================================ */
function SplitText({ 
  children, 
  className = "",
  delay = 0,
  stagger = 0.03
}: { 
  children: string; 
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const chars = children.split('');
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="flex flex-wrap">
        {chars.map((char, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ============================================
   FLOATING PARTICLES - Ambient motion
   ============================================ */
function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10,
    })), 
  []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[var(--cream)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[1px] bg-[var(--cream)] origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

/* ============================================
   MAIN
   ============================================ */
export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ctaHover, setCtaHover] = useState(false);
  const { toast } = useToast();
  
  const { scrollYProgress } = useScroll();
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [scrollValue, setScrollValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (v) => setScrollValue(v));
    return () => unsubscribe();
  }, [scrollProgress]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", details: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("https://formspree.io/f/xnjaavby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setFormSuccess(true);
        form.reset();
        setTimeout(() => { setDialogOpen(false); setFormSuccess(false); }, 2500);
      } else {
        toast({ title: "Error", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  }

  // Parallax values for hero
  const heroY = useTransform(scrollProgress, [0, 0.3], [0, -150]);
  const heroOpacity = useTransform(scrollProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-[#050505] text-white min-h-screen relative overflow-x-hidden">
      <div className="grain" />
      <CustomCursor />
      <MorphingBlob mouseX={mousePos.x} mouseY={mousePos.y} scrollProgress={scrollValue} isCtaHover={ctaHover} />
      <FloatingParticles />
      <ScrollProgress />
      <div className="curtain fixed inset-0 bg-[#050505] z-[100]" />

      {/* ============================================
          NAV
          ============================================ */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 md:py-8 mix-blend-difference"
      >
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/60 font-light">
          Solo
        </span>
        <MagneticButton
          onClick={() => setDialogOpen(true)}
          className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors duration-700"
          cursorText="Let's talk"
        >
          Start a project
        </MagneticButton>
      </motion.nav>

      {/* ============================================
          HERO - Sculptural Typography with Blob
          ============================================ */}
      <motion.section 
        className="min-h-screen flex items-center relative z-10"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="w-full px-6 md:px-12 lg:px-20">
          {/* Asymmetric layout */}
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* Left side - stacked */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: loaded ? 0.4 : 0, x: loaded ? 0 : -20 }}
                transition={{ duration: 1, delay: 2 }}
                className="mb-8"
              >
                <span className="text-[10px] tracking-[0.5em] uppercase font-light text-white/40">
                  Story-driven design
                </span>
              </motion.div>

              {/* Main headline - MASSIVE */}
              <div className="space-y-1 md:space-y-2">
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "110%" }}
                    animate={{ y: loaded ? 0 : "110%" }}
                    transition={{ duration: 1.4, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-[10vw] md:text-[7vw] lg:text-[6vw] xl:text-[5vw] font-light leading-[1.1] tracking-[-0.02em] text-white/90"
                  >
                    Let's build
                  </motion.h1>
                </div>
                <div className="overflow-hidden pb-[0.15em]">
                  <motion.h1
                    initial={{ y: "110%" }}
                    animate={{ y: loaded ? 0 : "110%" }}
                    transition={{ duration: 1.4, delay: 2.25, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-[10vw] md:text-[7vw] lg:text-[6vw] xl:text-[5vw] font-light leading-[1.1] tracking-[-0.02em] italic text-[var(--cream)]"
                  >
                    your digital legacy.
                  </motion.h1>
                </div>
              </div>
            </div>

            {/* Right side - offset content */}
            <motion.div 
              className="col-span-12 lg:col-span-4 xl:col-span-5 lg:col-start-9 xl:col-start-8 mt-16 lg:mt-0 lg:pb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
              transition={{ duration: 1, delay: 2.8 }}
            >
              <p className="text-[13px] md:text-[14px] text-white/30 font-light leading-[1.9] mb-10 max-w-sm">
                We interview you. Learn your story. Translate it into every pixel. 
                For those who refuse to blend in.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <MagneticButton
                  onClick={() => setDialogOpen(true)}
                  className="group relative overflow-hidden bg-[var(--cream)] hover:bg-white px-10 py-5 transition-all duration-700"
                  cursorText="Go"
                  onMouseEnter={() => setCtaHover(true)}
                  onMouseLeave={() => setCtaHover(false)}
                >
                  <span className="relative z-10 text-[10px] tracking-[0.3em] uppercase text-black font-medium flex items-center gap-3">
                    Start a conversation
                    <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </MagneticButton>
              </div>

              {/* Price - whispered */}
              <motion.div 
                className="mt-10 flex items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded ? 1 : 0 }}
                transition={{ duration: 1, delay: 3.2 }}
              >
                <span className="text-[12px] text-white/20 font-light tracking-wide">
                  $5,000 · 2 weeks
                </span>
                <span className="w-16 h-[1px] bg-white/10" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/15 font-light">
                  limited availability
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - absolute bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-light">
            Scroll
          </span>
          <div className="scroll-indicator w-[1px] h-16 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </motion.section>

      {/* ============================================
          THE CRAFT - Horizontal reveal section
          ============================================ */}
      <section className="relative py-40 md:py-56">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--cream)]/[0.02] to-transparent" />
        
        <div className="px-6 md:px-12 lg:px-20 max-w-[1800px] mx-auto relative z-10">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20"
          >
            <span className="text-[10px] tracking-[0.5em] uppercase font-light text-[var(--cream)]/50">
              The Process
            </span>
          </motion.div>

          {/* Three pillars - asymmetric grid */}
          <div className="grid grid-cols-12 gap-y-20 md:gap-y-0">
            {[
              { 
                num: "01", 
                word: "Interview", 
                line: "We don't start with wireframes. We start with questions. Your story becomes our blueprint.",
                align: "col-span-12 md:col-span-4 md:col-start-1"
              },
              { 
                num: "02", 
                word: "Design", 
                line: "Every color, every curve, every word—chosen to reflect who you are, not who the template says you should be.",
                align: "col-span-12 md:col-span-4 md:col-start-5 md:mt-32"
              },
              { 
                num: "03", 
                word: "Launch", 
                line: "Two weeks. A site that makes people pause. That's the promise.",
                align: "col-span-12 md:col-span-4 md:col-start-9 md:mt-64"
              },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                className={item.align}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <span className="text-[10px] text-[var(--cream)]/30 font-light tracking-[0.3em] block mb-4">
                  {item.num}
                </span>
                <h3 className="font-serif text-[12vw] md:text-[6vw] lg:text-[4.5vw] font-light text-white/90 leading-[0.9] mb-6">
                  {item.word}
                </h3>
                <p className="text-[13px] text-white/25 font-light leading-[1.9] max-w-xs">
                  {item.line}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          THE STATEMENT - Full-bleed typography
          ============================================ */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <motion.div
          className="px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-[1600px] mx-auto relative">
            {/* Big quote */}
            <div className="relative">
              <motion.div
                className="absolute -top-10 -left-4 md:-left-8 text-[15vw] font-serif text-[var(--cream)]/[0.05] leading-none select-none"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                "
              </motion.div>
              
              <div className="relative z-10">
                <SplitText 
                  className="font-serif text-[7vw] md:text-[5vw] lg:text-[4vw] font-light leading-[1.15] text-white/80"
                  delay={0.3}
                  stagger={0.02}
                >
                  We don't make websites.
                </SplitText>
                <div className="h-4 md:h-6" />
                <SplitText 
                  className="font-serif text-[7vw] md:text-[5vw] lg:text-[4vw] font-light leading-[1.15] italic text-[var(--cream)]"
                  delay={0.8}
                  stagger={0.02}
                >
                  We create digital legacies.
                </SplitText>
              </div>
            </div>

            {/* Attribution */}
            <motion.div
              className="mt-16 md:mt-20 flex items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              viewport={{ once: true }}
            >
              <span className="w-12 h-[1px] bg-white/10" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-white/20 font-light">
                Solo Design Philosophy
              </span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================
          FINAL CTA - The Close
          ============================================ */}
      <section className="py-40 md:py-56 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cream)]/[0.02] to-transparent" />
        
        <div className="px-6 md:px-12 lg:px-20 relative z-10">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* The big question */}
              <div className="mb-16">
                <div className="overflow-hidden">
                  <motion.h2
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="font-serif text-[18vw] md:text-[14vw] lg:text-[12vw] font-light leading-[0.85] tracking-[-0.04em] text-white/90"
                  >
                    Ready?
                  </motion.h2>
                </div>
              </div>

              {/* The details */}
              <div className="grid grid-cols-12 gap-8 items-end">
                <motion.div
                  className="col-span-12 md:col-span-5 lg:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <p className="text-[14px] text-white/30 font-light leading-[1.9] mb-10">
                    15 minutes. No pitch. Just a conversation about your story 
                    and whether we're the right fit to tell it.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <MagneticButton
                      onClick={() => setDialogOpen(true)}
                      className="group relative border border-white/10 hover:border-[var(--cream)]/40 hover:bg-[var(--cream)]/[0.03] px-10 py-5 transition-all duration-700"
                      cursorText="Let's go"
                    >
                      <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-[var(--cream)] transition-colors duration-500 font-light flex items-center gap-3">
                        Book a call
                        <svg className="w-4 h-4 text-white/30 group-hover:text-[var(--cream)] group-hover:translate-x-1 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </MagneticButton>
                  </div>
                </motion.div>

                <motion.div
                  className="col-span-12 md:col-span-4 md:col-start-9 text-right"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-block">
                    <span className="text-[13px] text-white/20 font-light block mb-2">
                      $5,000 · 2 weeks
                    </span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/10 font-light">
                      limited availability
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER - Minimal
          ============================================ */}
      <footer className="py-8 px-6 md:px-12 border-t border-white/[0.03] relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-white/20 font-light">
            Solo Designs
          </span>
          <span className="text-[11px] text-white/10 font-light italic">
            For those who refuse to blend in.
          </span>
          <span className="text-[10px] text-white/10 font-light">
            © {new Date().getFullYear()}
          </span>
        </div>
      </footer>

      {/* ============================================
          DIALOG
          ============================================ */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={() => { setDialogOpen(false); setFormSuccess(false); }}
            />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => { setDialogOpen(false); setFormSuccess(false); }}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors duration-500 group"
              data-hover
              data-cursor-text="Close"
            >
              <svg className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg px-6"
            >
              <AnimatePresence mode="wait">
                {formSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24"
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-10 rounded-full border border-[var(--cream)]/20 flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-[var(--cream)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="font-serif text-4xl font-light mb-4">Got it.</h3>
                    <p className="text-white/30 text-[14px] font-light">We'll be in touch within 24 hours.</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }}>
                    <div className="text-center mb-14">
                      <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">Let's talk.</h2>
                      <p className="text-white/30 text-[14px] font-light">Tell us about you and your vision.</p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Your name"
                                  {...field}
                                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-5 focus-visible:ring-0 focus-visible:border-[var(--cream)]/50 placeholder:text-white/20 text-[16px] font-light transition-colors duration-500"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] text-white/40 font-light mt-3" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Email"
                                  {...field}
                                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-5 focus-visible:ring-0 focus-visible:border-[var(--cream)]/50 placeholder:text-white/20 text-[16px] font-light transition-colors duration-500"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] text-white/40 font-light mt-3" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="details"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="What's your story?"
                                  {...field}
                                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-5 focus-visible:ring-0 focus-visible:border-[var(--cream)]/50 placeholder:text-white/20 min-h-[120px] resize-none text-[16px] font-light transition-colors duration-500"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] text-white/40 font-light mt-3" />
                            </FormItem>
                          )}
                        />
                        <div className="pt-8">
                          <button
                            type="submit"
                            className="w-full bg-[var(--cream)] hover:bg-white text-black py-5 text-[11px] tracking-[0.3em] uppercase font-medium transition-colors duration-500"
                            data-hover
                            data-cursor-text="Send"
                          >
                            Send message
                          </button>
                        </div>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
