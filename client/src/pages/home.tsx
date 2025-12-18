import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
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
  details: z.string().min(10, "Tell us more"),
});

/* ============================================
   CUSTOM CURSOR
   ============================================ */
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-hover]')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-hover]')) {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseEnter);
    document.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      <motion.div
        className={`custom-cursor hidden lg:block ${isHovering ? 'hovering' : ''}`}
        style={{ left: cursorXSpring, top: cursorYSpring }}
      />
      <motion.div
        className="custom-cursor-dot hidden lg:block"
        style={{ left: dotX, top: dotY }}
      />
    </>
  );
}

/* ============================================
   REVEAL TEXT - Line Animation
   ============================================ */
function RevealText({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 1, 
          delay,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
        toast({ title: "Message sent", description: "We'll be in touch within 24 hours." });
        setDialogOpen(false);
        form.reset();
      } else {
        toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen relative">
      {/* Grain */}
      <div className="grain" />
      
      {/* Custom Cursor */}
      <CustomCursor />
      
      {/* Curtain */}
      <div className="curtain fixed inset-0 bg-black z-[100]" />

      {/* ============================================
          NAVIGATION
          ============================================ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : -20 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 lg:px-20 py-6 md:py-8"
      >
        <span className="font-sans text-sm tracking-[0.3em] uppercase font-light">
          Solo
        </span>
        
        <button 
          onClick={() => setDialogOpen(true)}
          className="font-sans text-sm tracking-[0.15em] uppercase font-light link-slide pb-1"
          data-hover
        >
          Work with us
        </button>
      </motion.nav>

      {/* ============================================
          HERO SECTION - Minimalist Typography
          ============================================ */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
      >
        {/* Warm ambient glow - the soul */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.8 }}
            transition={{ duration: 2, delay: 1.5 }}
            className="w-[900px] h-[900px] md:w-[1200px] md:h-[1200px] rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(232, 220, 196, 0.15) 0%, rgba(200, 180, 140, 0.08) 30%, transparent 70%)',
              filter: 'blur(100px)'
            }}
          />
        </div>

        {/* Content - Centered */}
        <div className="relative z-10 text-center px-6 md:px-12 lg:px-20 max-w-[1200px] mx-auto w-full">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="mb-10 md:mb-14"
          >
            <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-white/35 font-light">
              Design Studio
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="font-serif font-light text-[10vw] md:text-[7vw] lg:text-[5.5vw] leading-[1.1] tracking-[-0.02em] mb-6 md:mb-8">
            <RevealText delay={2.2}>
              <span className="block">Your expertise deserves</span>
            </RevealText>
            <RevealText delay={2.4}>
              <span className="block">to be <span className="text-[var(--cream)] italic">seen.</span></span>
            </RevealText>
          </h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 2.8 }}
            className="font-sans text-sm md:text-base text-white/40 font-light max-w-md mx-auto mb-14 md:mb-20"
          >
            Premium digital experiences for those who refuse to blend in.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 3 }}
          >
            <button 
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-3 font-sans text-[11px] md:text-xs tracking-[0.25em] uppercase font-light text-white/60 hover:text-[var(--cream)] transition-colors duration-500 group"
              data-hover
            >
              <span>Start a project</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 1, delay: 3.4 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-white/20 font-light">Scroll</span>
            <div className="w-px h-10 scroll-indicator bg-gradient-to-b from-[var(--cream)]/40 to-transparent" />
          </motion.div>
      </motion.section>

      {/* ============================================
          PHILOSOPHY SECTION
          ============================================ */}
      <section className="py-32 md:py-48 flex items-center relative px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Subtle warmth */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-[600px] h-[600px] rounded-full opacity-60"
            style={{ 
              background: 'radial-gradient(circle, rgba(232, 220, 196, 0.04) 0%, transparent 60%)',
              filter: 'blur(60px)'
            }}
          />
        </div>
        
        <div className="max-w-[900px] mx-auto w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-20%" }}
          >
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light leading-[1.2] mb-8">
              Stop explaining your value.
              <br />
              <span className="text-[var(--cream)] italic">Start showing it.</span>
            </h2>
            
            <p className="font-sans text-white/40 text-base md:text-lg leading-relaxed max-w-lg mx-auto font-light">
              The best founders don't have a visibility problem—they have a translation problem. 
              We bridge that gap.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SERVICES - Clean Horizontal List
          ============================================ */}
      <section className="py-28 md:py-40 relative px-6 md:px-12 lg:px-20">
        <div className="max-w-[1000px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-10%" }}
            className="text-center"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30 font-light block mb-16 md:mb-20">
              What We Do
            </span>
            
            {/* Simple inline list */}
            <p className="font-serif text-2xl md:text-4xl lg:text-5xl font-light leading-[1.4] text-white/80">
              <span className="text-white/40">We craft</span> brand strategy<span className="text-white/30">,</span>
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>web experiences<span className="text-white/30">, &</span> visual identity
              <br />
              <span className="text-white/40">for those who refuse to</span> <span className="text-[var(--cream)] italic">blend in.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-32 md:py-44 relative px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Warm ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(232, 220, 196, 0.12) 0%, rgba(200, 180, 140, 0.06) 40%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
        </div>
        
        <div className="max-w-[1000px] mx-auto w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-20%" }}
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30 mb-10 block font-light">
              Ready?
            </span>
            
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-14">
              Let's build something
              <br />
              <span className="italic text-[var(--cream)]">unforgettable.</span>
            </h2>
            
            <button 
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-3 font-sans text-[11px] md:text-xs tracking-[0.25em] uppercase font-light text-white/60 hover:text-[var(--cream)] transition-colors duration-500 group"
              data-hover
            >
              <span>Start a project</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER - Minimal
          ============================================ */}
      <footer className="py-10 md:py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1000px] mx-auto w-full text-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/20 font-light">
            © 2025 Solo
          </span>
        </div>
      </footer>

      {/* ============================================
          FULLSCREEN DIALOG - Clean Minimal
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
            {/* Background with warm glow */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="w-[600px] h-[600px] rounded-full"
                style={{ 
                  background: 'radial-gradient(circle, rgba(232, 220, 196, 0.08) 0%, transparent 60%)',
                  filter: 'blur(80px)'
                }}
              />
            </div>
            
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={() => setDialogOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
              data-hover
            >
              Close
            </motion.button>
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 w-full max-w-md px-6"
            >
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-light mb-3">
                  Let's talk.
                </h2>
                <p className="text-white/35 text-sm font-light">
                  Tell us about your project.
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                          >
                            <Input 
                              placeholder="Name" 
                              {...field} 
                              className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-[var(--cream)] placeholder:text-white/25 text-base font-light transition-colors"
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                          >
                            <Input 
                              placeholder="Email" 
                              {...field} 
                              className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-[var(--cream)] placeholder:text-white/25 text-base font-light transition-colors"
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                          >
                            <Textarea 
                              placeholder="Tell us about your project" 
                              {...field} 
                              className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-[var(--cream)] placeholder:text-white/25 min-h-[80px] resize-none text-base font-light transition-colors"
                            />
                          </motion.div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="pt-6 text-center"
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.25em] uppercase font-light text-white/60 hover:text-[var(--cream)] transition-colors duration-500 group"
                      data-hover
                    >
                      <span>Send Message</span>
                      <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
