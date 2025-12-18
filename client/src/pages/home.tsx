import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
   CURSOR SPOTLIGHT
   ============================================ */
function CursorSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      className="cursor-spotlight hidden lg:block"
      style={{ left: xSpring, top: ySpring }}
    />
  );
}

/* ============================================
   MAGNETIC BUTTON
   ============================================ */
function MagneticButton({ 
  children, 
  className = "",
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 200 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ============================================
   REVEAL TEXT - The Signature Animation
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
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 1.2, 
          delay,
          ease: [0.77, 0, 0.175, 1] 
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ============================================
   PARALLAX LAYER
   ============================================ */
function ParallaxLayer({ 
  children, 
  speed = 0.5,
  className = ""
}: { 
  children: React.ReactNode; 
  speed?: number;
  className?: string;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200 * speed]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function Home() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", details: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({ title: "Request received", description: "We'll be in touch within 24 hours." });
    setOpen(false);
    form.reset();
  }

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen relative">
      {/* Grain Overlay */}
      <div className="grain" />
      
      {/* Cursor Spotlight */}
      <CursorSpotlight />
      
      {/* Curtain Reveal */}
      <div className="curtain fixed inset-0 bg-black z-[100]" />

      {/* ============================================
          NAVIGATION
          ============================================ */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 lg:px-16 py-6 md:py-8 blend-difference"
      >
        <span className="font-sans text-xs md:text-sm tracking-[0.25em] uppercase font-medium">
          Solo
        </span>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="font-sans text-xs md:text-sm tracking-[0.15em] uppercase link-slide pb-1">
              Work with us
            </button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/10 p-0 rounded-none" aria-describedby="dialog-desc">
            <div className="p-8 md:p-10">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="h-px w-12 bg-[var(--cream)] origin-left mb-8"
              />
              
              <DialogTitle className="font-serif text-3xl md:text-4xl font-normal mb-2">
                Let's create.
              </DialogTitle>
              <DialogDescription id="dialog-desc" className="text-white/40 text-sm mb-8">
                Share your vision with us.
              </DialogDescription>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field} 
                            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-white/30 placeholder:text-white/20"
                          />
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
                          <Input 
                            placeholder="Email" 
                            {...field} 
                            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-white/30 placeholder:text-white/20"
                          />
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
                          <Textarea 
                            placeholder="Tell us about your project" 
                            {...field} 
                            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-white/30 placeholder:text-white/20 min-h-[100px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <MagneticButton
                    className="w-full bg-[var(--cream)] text-black py-4 font-sans text-sm tracking-[0.15em] uppercase font-medium hover:bg-white transition-colors mt-4"
                  >
                    Send
                  </MagneticButton>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </motion.nav>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex flex-col justify-center relative px-6 md:px-10 lg:px-16"
      >
        {/* Floating Elements - Depth */}
        <ParallaxLayer speed={0.3} className="absolute top-[15%] right-[8%] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: loaded ? 0.15 : 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 2.5 }}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/20 float-slow"
          />
        </ParallaxLayer>
        
        <ParallaxLayer speed={0.5} className="absolute bottom-[20%] left-[5%] pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 0.08 : 0 }}
            transition={{ duration: 1.5, delay: 2.8 }}
            className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-[var(--cream)] blur-[100px] float-medium"
          />
        </ParallaxLayer>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto w-full relative z-10">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="mb-8 md:mb-12"
          >
            <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/40">
              Design Studio — Est. 2025
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="font-serif font-normal text-[11vw] md:text-[9vw] lg:text-[7.5vw] leading-[0.95] tracking-[-0.02em] mb-12 md:mb-16">
            <RevealText delay={2.4}>
              <span className="block">Your expertise</span>
            </RevealText>
            <RevealText delay={2.55}>
              <span className="block">deserves to be</span>
            </RevealText>
            <RevealText delay={2.7}>
              <span className="block text-[var(--cream)]">seen.</span>
            </RevealText>
          </h1>

          {/* Subline & CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
              transition={{ duration: 1, delay: 3 }}
              className="lg:col-span-5"
            >
              <p className="font-sans text-base md:text-lg lg:text-xl text-white/50 font-light leading-relaxed">
                We craft digital experiences for those who refuse to blend in. 
                <span className="text-white"> Premium design. Limited availability.</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
              transition={{ duration: 1, delay: 3.2 }}
              className="lg:col-start-10 lg:col-span-3"
            >
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="group flex items-center gap-4 font-sans text-sm tracking-[0.1em] uppercase">
                    <span className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-[var(--cream)] group-hover:border-[var(--cream)] transition-all duration-500">
                      <svg 
                        className="w-4 h-4 group-hover:text-black transition-colors duration-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </span>
                    <span className="link-slide pb-1">Book a call</span>
                  </button>
                </DialogTrigger>
              </Dialog>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent scroll-indicator" />
        </motion.div>
      </motion.section>

      {/* ============================================
          PHILOSOPHY SECTION
          ============================================ */}
      <section className="min-h-screen flex items-center relative px-6 md:px-10 lg:px-16 py-32">
        <div className="max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            viewport={{ once: true, margin: "-20%" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16"
          >
            <div className="lg:col-span-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30">01 — Philosophy</span>
            </div>
            
            <div className="lg:col-span-8">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.3] mb-12">
                Stop explaining your value.
                <br />
                <span className="text-[var(--cream)] italic">Start showing it.</span>
              </h2>
              
              <p className="font-sans text-white/40 text-base md:text-lg leading-relaxed max-w-2xl">
                The best founders, leaders, and experts don't have a visibility problem—they have a 
                translation problem. We bridge the gap between what you do and how the world perceives it.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SERVICES SECTION
          ============================================ */}
      <section className="py-32 relative px-6 md:px-10 lg:px-16 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
            viewport={{ once: true, margin: "-10%" }}
            className="mb-20"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30">02 — Services</span>
          </motion.div>

          <div className="space-y-0">
            {[
              { num: "01", title: "Brand Strategy", desc: "Positioning that resonates" },
              { num: "02", title: "Web Design", desc: "Experiences that convert" },
              { num: "03", title: "Visual Identity", desc: "Systems that scale" },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.77, 0, 0.175, 1] }}
                viewport={{ once: true, margin: "-10%" }}
                className="group grid grid-cols-12 gap-4 py-8 md:py-12 border-b border-white/5 hover:border-white/20 transition-colors cursor-default"
              >
                <span className="col-span-2 md:col-span-1 font-serif text-white/20 text-sm">{service.num}</span>
                <h3 className="col-span-10 md:col-span-5 font-serif text-2xl md:text-3xl lg:text-4xl group-hover:text-[var(--cream)] transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="col-span-12 md:col-span-4 md:col-start-9 font-sans text-white/40 text-sm md:text-base self-center">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-32 md:py-48 relative px-6 md:px-10 lg:px-16">
        <ParallaxLayer speed={0.2} className="absolute top-[20%] right-[15%] pointer-events-none">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-[var(--cream)]/20 float-medium" />
        </ParallaxLayer>

        <div className="max-w-[1400px] mx-auto w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            viewport={{ once: true, margin: "-20%" }}
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8 block">
              Ready?
            </span>
            
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.1] mb-12">
              Let's build something
              <br />
              <span className="italic text-[var(--cream)]">unforgettable.</span>
            </h2>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-3 border border-white/20 hover:border-[var(--cream)] hover:text-[var(--cream)] px-8 md:px-12 py-4 md:py-5 font-sans text-sm tracking-[0.15em] uppercase transition-all duration-500">
                  <span>Start a project</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </button>
              </DialogTrigger>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="py-8 px-6 md:px-10 lg:px-16 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/20">
            © 2025 Solo Design Studio
          </span>
          
          <div className="flex gap-8">
            {["Twitter", "LinkedIn", "Dribbble"].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-[var(--cream)] transition-colors link-slide pb-1"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
