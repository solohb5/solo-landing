import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import bgTexture from "@assets/generated_images/minimalist_luxury_texture.png";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  details: z.string().min(10, "Please provide some details about your project"),
});

export default function Home() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      details: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock submission
    console.log(values);
    toast({
      title: "Request Received",
      description: "We will be in touch shortly.",
    });
    setOpen(false);
    form.reset();
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url(${bgTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Noise Overlay for texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-6xl sm:text-8xl md:text-9xl font-serif tracking-tight font-medium leading-[0.9] text-primary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          >
            Solo Designs
          </motion.h1>
          
          <motion.p 
            className="mt-8 text-lg sm:text-xl md:text-2xl font-sans font-light tracking-wide text-muted-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
          >
            Unbelievably Minimalist. World Class.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 1.2 }}
            className="mt-16"
          >
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base px-8 py-6 rounded-none uppercase tracking-widest transition-all duration-500 hover:tracking-[0.2em]"
                >
                  Book Consultation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white/95 backdrop-blur-md rounded-none">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-serif font-normal text-center">Inquire</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-widest text-muted-foreground">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-lg" />
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
                          <FormLabel className="uppercase text-xs tracking-widest text-muted-foreground">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} className="border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-lg" />
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
                          <FormLabel className="uppercase text-xs tracking-widest text-muted-foreground">Project Details</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your vision..." {...field} className="resize-none border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-lg min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 flex justify-end">
                      <Button type="submit" className="rounded-none w-full uppercase tracking-widest py-6 bg-primary hover:bg-primary/90">
                        Send Request
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      </main>
      
      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-sans">
          Est. 2024 — New York / Paris / Tokyo
        </p>
      </footer>
    </div>
  );
}
