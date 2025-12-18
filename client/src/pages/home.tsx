import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowUpRight } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  details: z.string().min(10, "Please provide some details about your project"),
});

// Custom Cursor Component
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    document.body.classList.add('custom-cursor-enabled');
    
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
        cursorRef.current.style.transform = `translate(-50%, -50%)`;
        
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
        dotRef.current.style.transform = `translate(-50%, -50%)`;
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', moveCursor);
    
    const interactiveElements = document.querySelectorAll('button, a, [data-cursor-hover]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        className={`custom-cursor hidden md:block ${isHovering ? 'hovering' : ''}`}
      />
      <div ref={dotRef} className="cursor-dot hidden md:block" />
    </>
  );
}

// Magnetic Button Component
function MagneticButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Split Text Animation Component
function SplitText({ 
  text, 
  className = "", 
  delay = 0,
  staggerDelay = 0.03 
}: { 
  text: string; 
  className?: string; 
  delay?: number;
  staggerDelay?: number;
}) {
  const words = text.split(" ");
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + wordIndex * staggerDelay * 3,
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Animated Counter
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(eased * value));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return <span>{count}</span>;
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      details: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Request Received",
      description: "We'll be in touch within 24 hours.",
    });
    setOpen(false);
    form.reset();
  }

  return (
    <div 
      ref={containerRef}
      className="bg-background text-foreground min-h-screen w-full overflow-x-hidden selection:bg-[hsl(45,100%,60%)] selection:text-black relative"
    >
      <CustomCursor />

      {/* Noise Overlay */}
      <div className="noise-overlay fixed inset-0 z-50 pointer-events-none" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="gradient-orb absolute w-[800px] h-[800px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,200,100,0.15) 0%, transparent 70%)',
            left: '60%',
            top: '-20%',
            x: useTransform(useMotionValue(mousePosition.x), [0, 1], [-50, 50]),
            y: useTransform(useMotionValue(mousePosition.y), [0, 1], [-30, 30]),
          }}
        />
        <div 
          className="gradient-orb-2 absolute w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(100,150,255,0.1) 0%, transparent 70%)',
            left: '-10%',
            bottom: '-20%',
          }}
        />
        <div 
          className="gradient-orb-3 absolute w-[500px] h-[500px] rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            right: '10%',
            bottom: '20%',
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-8 md:px-12 lg:px-16"
      >
        <div className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-white/80">
          Solo
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              data-cursor-hover
              className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-500"
            >
              <span>Inquire</span>
              <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] border border-white/10 shadow-2xl bg-black/95 backdrop-blur-xl text-white rounded-none p-0 overflow-hidden">
            <div className="relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-[hsl(45,100%,60%)]/30" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b border-l border-[hsl(45,100%,60%)]/30" />
              
              <div className="p-10 md:p-12">
                <DialogHeader className="mb-10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 60 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-[1px] bg-gradient-to-r from-[hsl(45,100%,60%)] to-transparent mb-6"
                  />
                  <DialogTitle className="text-4xl md:text-5xl font-serif font-normal italic">
                    Let's Talk
                  </DialogTitle>
                  <p className="text-sm text-white/40 mt-4 font-light">
                    Share your vision. We'll craft the digital presence it deserves.
                  </p>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[10px] tracking-[0.2em] text-white/40 font-sans font-medium">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your name" 
                              {...field} 
                              className="border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-[hsl(45,100%,60%)] bg-transparent text-lg placeholder:text-white/20 transition-colors" 
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
                          <FormLabel className="uppercase text-[10px] tracking-[0.2em] text-white/40 font-sans font-medium">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-[hsl(45,100%,60%)] bg-transparent text-lg placeholder:text-white/20 transition-colors" 
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
                          <FormLabel className="uppercase text-[10px] tracking-[0.2em] text-white/40 font-sans font-medium">Your Vision</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project..." 
                              {...field} 
                              className="resize-none border-0 border-b border-white/10 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-[hsl(45,100%,60%)] bg-transparent text-lg min-h-[100px] placeholder:text-white/20 transition-colors" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <MagneticButton
                        type="submit"
                        className="group w-full uppercase tracking-[0.2em] py-5 px-8 bg-[hsl(45,100%,60%)] text-black font-sans font-semibold text-sm hover:bg-[hsl(45,100%,65%)] transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        Send Request
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </MagneticButton>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col justify-center px-6 md:px-12 lg:px-16 pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 md:mb-12"
          >
            <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">
              Design Studio
            </span>
          </motion.div>

          {/* Main Headline */}
          <div className="relative">
            <h1 className="text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] font-serif tracking-[-0.02em]">
              <div className="overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="block text-shimmer"
                >
                  Websites that
                </motion.span>
              </div>
              <div className="overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  className="block italic text-[hsl(45,100%,60%)]"
                >
                  speak louder
                </motion.span>
              </div>
              <div className="overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  than words.
                </motion.span>
              </div>
            </h1>

            {/* Decorative Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-4 md:right-0 top-1/2 w-24 md:w-40 h-[1px] bg-gradient-to-r from-[hsl(45,100%,60%)] to-transparent origin-left"
            />
          </div>

          {/* Subtext and CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-end"
          >
            <div className="max-w-lg">
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
                Stop explaining your value.{" "}
                <span className="text-white">Start showing it.</span>{" "}
                We craft digital experiences that make your expertise impossible to ignore.
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-8">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <MagneticButton
                    data-cursor-hover
                    className="group relative overflow-hidden bg-white text-black h-16 px-10 text-sm uppercase tracking-[0.15em] font-sans font-semibold transition-all duration-500 hover:bg-[hsl(45,100%,60%)] flex items-center gap-4"
                  >
                    <span className="relative z-10">Book Consultation</span>
                    <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </MagneticButton>
                </DialogTrigger>
              </Dialog>
              
              <p className="text-xs text-white/30 uppercase tracking-[0.2em]">
                Limited Availability
              </p>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="mt-24 md:mt-32 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            {[
              { value: 12, label: "Years Experience" },
              { value: 200, label: "Projects Delivered", suffix: "+" },
              { value: 98, label: "Client Satisfaction", suffix: "%" },
              { value: 5, label: "Design Awards" },
            ].map((stat, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="font-serif text-4xl md:text-5xl text-white mb-2">
                  <AnimatedNumber value={stat.value} delay={2.4 + index * 0.1} />
                  {stat.suffix && <span>{stat.suffix}</span>}
                </div>
                <div className="text-xs uppercase tracking-[0.15em] text-white/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 lg:px-16 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="font-sans text-xs uppercase tracking-[0.4em] text-white/40">
              What We Do
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                number: "01",
                title: "Brand Identity",
                description: "Strategic positioning and visual systems that capture your essence and resonate with your audience."
              },
              {
                number: "02", 
                title: "Web Design",
                description: "Bespoke websites that combine aesthetic excellence with seamless functionality."
              },
              {
                number: "03",
                title: "Digital Strategy",
                description: "Comprehensive digital roadmaps that align your online presence with business objectives."
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group bg-background p-8 md:p-12 hover:bg-white/[0.02] transition-colors duration-500"
                data-cursor-hover
              >
                <span className="font-serif text-[hsl(45,100%,60%)] text-sm mb-6 block">{service.number}</span>
                <h3 className="font-serif text-2xl md:text-3xl mb-4 group-hover:text-[hsl(45,100%,60%)] transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-24 md:py-40 px-6 md:px-12 lg:px-16">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-8 leading-[1.1]">
              Ready to <span className="italic text-[hsl(45,100%,60%)]">elevate</span><br />
              your digital presence?
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-12">
              We take on a limited number of clients each quarter to ensure exceptional results.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <MagneticButton
                  data-cursor-hover
                  className="group inline-flex items-center gap-4 bg-transparent border border-white/20 hover:border-[hsl(45,100%,60%)] hover:text-[hsl(45,100%,60%)] text-white h-16 px-12 text-sm uppercase tracking-[0.15em] font-sans font-medium transition-all duration-500"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </MagneticButton>
              </DialogTrigger>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 md:px-12 lg:px-16 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-sans text-xs uppercase tracking-[0.3em] text-white/30">
            Solo Design Studio © 2025
          </div>
          <div className="flex gap-8">
            {["Twitter", "LinkedIn", "Dribbble"].map((social) => (
              <a 
                key={social}
                href="#" 
                className="text-xs uppercase tracking-[0.2em] text-white/30 hover:text-[hsl(45,100%,60%)] transition-colors duration-300"
                data-cursor-hover
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
