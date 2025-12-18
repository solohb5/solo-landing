import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRight, Menu, X } from "lucide-react";
import heroImg from "@assets/generated_images/dark_liquid_chrome_abstract_wave.png";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  details: z.string().min(10, "Please provide some details about your project"),
});

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
      description: "We will be in touch shortly.",
    });
    setOpen(false);
    form.reset();
  }

  return (
    <div className="bg-background text-foreground h-screen w-full overflow-hidden selection:bg-white selection:text-black relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-8 md:px-12 bg-transparent mix-blend-difference text-white">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-sm font-serif tracking-[0.2em] uppercase"
        >
          Solo Designs
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
        >
           <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-opacity duration-500">
                  [ Inquire ]
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-zinc-950/95 backdrop-blur-xl text-white rounded-none p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr,2fr] h-full min-h-[500px]">
                   <div className="hidden md:flex flex-col justify-between p-8 bg-zinc-900/50 border-r border-white/10">
                      <div>
                        <h3 className="font-serif text-3xl mb-4 italic">Let's Create.</h3>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed">
                          Tell us about your ambition. We take on a limited number of clients per year to ensure absolute focus.
                        </p>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest">
                        Solo Designs &copy; 2025
                      </div>
                   </div>
                   <div className="p-8 md:p-10 flex flex-col justify-center">
                    <DialogHeader className="mb-8 md:hidden">
                      <DialogTitle className="text-2xl font-serif font-normal">Inquire</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-[10px] tracking-widest text-zinc-500">Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} className="border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-white bg-transparent text-lg placeholder:text-zinc-700" />
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
                              <FormLabel className="uppercase text-[10px] tracking-widest text-zinc-500">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="jane@company.com" {...field} className="border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-white bg-transparent text-lg placeholder:text-zinc-700" />
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
                              <FormLabel className="uppercase text-[10px] tracking-widest text-zinc-500">Vision</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the project..." {...field} className="resize-none border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-white bg-transparent text-lg min-h-[80px] placeholder:text-zinc-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="pt-6 flex justify-end">
                          <Button type="submit" className="group rounded-none w-full md:w-auto uppercase tracking-widest py-6 px-8 bg-white text-black hover:bg-zinc-200 transition-colors">
                            Submit Request
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                   </div>
                </div>
              </DialogContent>
            </Dialog>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-full w-full flex flex-col justify-center px-6 md:px-12 overflow-hidden">
        {/* Abstract Background Elements with Parallax */}
        <motion.div 
          className="absolute inset-0 z-0"
          animate={{
            x: mousePosition.x * -20,
            y: mousePosition.y * -20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        >
             <div className="absolute inset-0 bg-black/40 z-10" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
             <img 
               src={heroImg} 
               alt="Abstract Architecture" 
               className="w-[110%] h-[110%] object-cover object-center opacity-60 grayscale contrast-125 scale-110" 
             />
        </motion.div>
        
        <motion.div 
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-20 max-w-[90vw]"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-[13vw] leading-[0.8] font-serif font-light tracking-tighter text-white mix-blend-overlay opacity-90"
          >
            Digital <br />
            <span className="italic font-normal pl-[4vw]">Legacy.</span>
          </motion.h1>

          <motion.div 
            variants={fadeInUp}
            className="mt-16 md:mt-24 flex flex-col md:flex-row gap-12 items-start md:items-end border-t border-white/20 pt-8 max-w-4xl"
          >
            <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-lg">
              Stop explaining your value. <span className="text-white font-normal">Start showing it.</span> We craft the kind of undeniable digital presence that makes your expertise impossible to ignore.
            </p>
            
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none bg-white text-black hover:bg-zinc-200 h-16 px-12 text-sm uppercase tracking-[0.2em] transition-all duration-500 hover:tracking-[0.3em]">
                    Book Consultation
                  </Button>
                </DialogTrigger>
            </Dialog>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer / Copyright - Minimal */}
      <div className="absolute bottom-8 left-6 md:left-12 z-20 mix-blend-difference text-white">
         <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">
           Est. 2025 — NYC / PAR / TYO
         </p>
      </div>
    </div>
  );
}
