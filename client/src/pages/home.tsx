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
import heroImg from "@assets/generated_images/abstract_architectural_glass_and_light.png";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="bg-background text-foreground min-h-screen selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 md:px-12 transition-all duration-500 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/50' : 'bg-transparent'}`}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-xl font-serif tracking-widest uppercase font-bold"
        >
          Solo Designs
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
           <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-none border-white/20 hover:bg-white hover:text-black transition-colors duration-500 uppercase tracking-widest text-xs h-10 px-6">
                  Inquire
                </Button>
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
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none z-0 mix-blend-screen">
             <div className="w-full h-full bg-gradient-to-l from-white/10 to-transparent" />
             <img src={heroImg} alt="Abstract Architecture" className="w-full h-full object-cover object-left opacity-50 grayscale contrast-125" />
        </div>
        
        <motion.div 
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-[10vw] leading-[0.9] font-serif font-light tracking-tight text-balance mix-blend-difference text-white"
          >
            Build your <br />
            <span className="italic font-normal pl-[2vw]">Digital Legacy.</span>
          </motion.h1>

          <motion.div 
            variants={fadeInUp}
            className="mt-12 md:mt-20 flex flex-col md:flex-row gap-8 md:items-end border-t border-white/10 pt-8"
          >
            <p className="max-w-md text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
              The internet is noisy. <span className="text-white font-normal">Be the signal.</span> We bring elite, world-class design to those bold enough to claim it—without the agency price tag.
            </p>
            
            <div className="flex gap-4">
              <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-none bg-white text-black hover:bg-zinc-200 h-14 px-10 text-sm uppercase tracking-widest transition-transform hover:-translate-y-1 duration-300">
                      Book Consultation
                    </Button>
                  </DialogTrigger>
              </Dialog>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Selected Works Teaser */}
      <section className="py-32 px-6 md:px-12 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
           <div className="flex justify-between items-end mb-16">
              <h2 className="text-4xl md:text-6xl font-serif">Selected Works</h2>
              <span className="hidden md:block text-zinc-500 uppercase tracking-widest text-xs">(2023 — 2025)</span>
           </div>

           <div className="space-y-0">
              {[
                { name: "Vanguard Architecture", cat: "Digital Identity", year: "2024" },
                { name: "Oasis Ventures", cat: "Platform Design", year: "2024" },
                { name: "Maison Étude", cat: "E-Commerce", year: "2023" },
                { name: "Carbon & Co.", cat: "Portfolio", year: "2023" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative flex items-center justify-between py-12 border-t border-white/10 hover:bg-white/5 transition-colors duration-500 cursor-pointer px-4"
                >
                  <h3 className="text-2xl md:text-4xl font-light group-hover:pl-4 transition-all duration-500">{item.name}</h3>
                  <div className="flex items-center gap-8 md:gap-16 text-xs md:text-sm text-zinc-500 font-mono uppercase tracking-widest">
                    <span className="hidden md:block">{item.cat}</span>
                    <span>{item.year}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-white/10" />
           </div>
        </div>
      </section>

      {/* Statement Section */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-white text-black text-center flex flex-col items-center justify-center">
         <p className="text-xs uppercase tracking-[0.3em] mb-8 text-zinc-500">The Philosophy</p>
         <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif max-w-5xl leading-tight">
           "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."
         </h2>
         <p className="mt-8 font-sans text-zinc-500 italic">— Antoine de Saint-Exupéry</p>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 bg-black text-zinc-400 border-t border-white/10">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div>
               <h2 className="text-2xl font-serif text-white mb-2">Solo Designs</h2>
               <p className="text-sm font-light">Based in New York City.</p>
            </div>
            
            <div className="flex gap-8 text-xs uppercase tracking-widest">
               <a href="#" className="hover:text-white transition-colors">Instagram</a>
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
               <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
         </div>
         <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between text-[10px] uppercase tracking-widest opacity-50">
            <span>&copy; 2025 Solo Designs Inc.</span>
            <span className="mt-2 md:mt-0">All Rights Reserved.</span>
         </div>
      </footer>
    </div>
  );
}
