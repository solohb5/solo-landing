import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ArrowUpRight } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  details: z.string().min(10, "Tell us more"),
});

// Cursor glow that follows mouse
function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
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
      className="cursor-glow hidden md:block"
      style={{ left: xSpring, top: ySpring }}
    />
  );
}

// Magnetic element
function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", details: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({ title: "Message sent", description: "We'll be in touch within 24 hours." });
    setOpen(false);
    form.reset();
  }

  const words = ["Design", "that", "demands", "attention."];

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* Intro Curtain */}
      <div className="intro-curtain fixed inset-0 bg-black z-[100]" />
      
      {/* Grain Overlay */}
      <div className="grain" />
      
      {/* Cursor Glow */}
      <CursorGlow />

      {/* Navigation */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-8"
      >
        <div className="font-sans text-sm tracking-[0.2em] uppercase font-medium">
          Solo
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="group flex items-center gap-3 font-sans text-sm tracking-[0.1em] uppercase magnetic">
              <span className="link-underline">Start a project</span>
              <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="max-w-[480px] bg-black border border-white/10 p-0 rounded-none" aria-describedby="dialog-description">
            <div className="p-10 md:p-12">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-px bg-[hsl(35,100%,55%)] mb-10"
              />
              
              <DialogTitle className="font-serif text-4xl md:text-5xl font-light mb-3">
                Let's talk.
              </DialogTitle>
              <DialogDescription id="dialog-description" className="text-white/40 text-sm mb-10">
                Tell us about your vision.
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
                            placeholder="Name" 
                            {...field} 
                            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 text-lg placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/40 transition-colors"
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
                            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 text-lg placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/40 transition-colors"
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
                            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-4 text-lg placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/40 transition-colors min-h-[120px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Magnetic className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-[hsl(35,100%,55%)] text-black py-5 font-sans text-sm tracking-[0.15em] uppercase font-semibold hover:bg-[hsl(35,100%,60%)] transition-colors"
                    >
                      Send Message
                    </button>
                  </Magnetic>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </motion.header>

      {/* Hero */}
      <main className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative z-10">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Main Headline */}
          <h1 className="mb-16 md:mb-24">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: showContent ? 1 : 0, 
                  y: showContent ? 0 : 100 
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.8 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onMouseEnter={() => setHoveredWord(i)}
                onMouseLeave={() => setHoveredWord(null)}
                className={`
                  inline-block mr-[0.15em] font-serif font-light
                  text-[15vw] md:text-[12vw] lg:text-[10vw] leading-[0.9] tracking-[-0.03em]
                  transition-all duration-500 cursor-default
                  ${i === 2 ? 'italic text-[hsl(35,100%,55%)]' : ''}
                  ${hoveredWord !== null && hoveredWord !== i ? 'opacity-20' : 'opacity-100'}
                `}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subline */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 40 }}
            transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4"
          >
            <div className="md:col-span-5 lg:col-span-4">
              <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed">
                We create digital experiences for those who refuse to blend in.
                <span className="text-white"> One client at a time.</span>
              </p>
            </div>
            
            <div className="md:col-start-9 md:col-span-4 lg:col-start-10 lg:col-span-3 flex flex-col gap-6">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-6xl font-serif">12</span>
                <span className="text-white/40 text-sm uppercase tracking-wider">Years</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-6xl font-serif">∞</span>
                <span className="text-white/40 text-sm uppercase tracking-wider">Possibilities</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Marquee Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="fixed bottom-0 left-0 right-0 border-t border-white/5 py-5 overflow-hidden z-40"
      >
        <div className="marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="inline-block">
              {["Brand Identity", "Web Design", "Digital Strategy", "Creative Direction", "Visual Systems", "Art Direction"].map((item, j) => (
                <span key={j} className="inline-flex items-center mx-8">
                  <span className="text-white/30 text-sm uppercase tracking-[0.2em] font-sans">{item}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(35,100%,55%)] ml-8" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </motion.footer>

      {/* Corner Accents */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="fixed bottom-20 left-6 md:left-12 z-30"
      >
        <a 
          href="mailto:hello@solo.design" 
          className="text-white/30 text-sm font-sans hover:text-white transition-colors link-underline"
        >
          hello@solo.design
        </a>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="fixed bottom-20 right-6 md:right-12 z-30"
      >
        <span className="text-white/30 text-sm font-sans">
          NYC / LA / REMOTE
        </span>
      </motion.div>
    </div>
  );
}
