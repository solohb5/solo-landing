import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Tell us a bit more about your brand"),
});

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, this would submit the form
    // For now, we'll just close the modal after a short delay
    setTimeout(() => {
      onClose();
      form.reset();
    }, 1000);
  }

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-solo-bg/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-solo-bg border border-solo-rule p-8 md:p-12 relative pointer-events-auto overflow-y-auto max-h-full shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-solo-text-muted hover:text-solo-accent transition-colors"
              >
                <X size={24} />
              </button>
              
              {/* Signature Square */}
              <div className="absolute bottom-6 right-6 w-4 h-4 bg-solo-accent animate-heartbeat" />

              <div className="flex flex-col gap-12">
                {/* Header */}
                <div className="space-y-6">
                  <h2 className="font-display italic text-4xl md:text-5xl text-solo-accent">
                    Let's build
                  </h2>
                  <div className="space-y-3">
                    <p className="font-body text-lg text-solo-text-muted">
                      Tell us a bit about yourself and we'll reach out to start the conversation.
                    </p>
                    <p className="font-mono text-xs uppercase tracking-widest text-solo-text-muted">
                      Current wait: <span className="text-solo-accent">3 weeks</span>
                    </p>
                  </div>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="[ Name ]" 
                              {...field} 
                              className="bg-transparent border-0 border-b border-solo-rule rounded-none px-0 py-4 text-xl font-body placeholder:text-solo-text-muted/50 focus-visible:ring-0 focus-visible:border-solo-accent transition-colors"
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
                              placeholder="[ Email ]" 
                              {...field} 
                              className="bg-transparent border-0 border-b border-solo-rule rounded-none px-0 py-4 text-xl font-body placeholder:text-solo-text-muted/50 focus-visible:ring-0 focus-visible:border-solo-accent transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="[ Tell us about your brand ]" 
                              {...field} 
                              className="bg-transparent border-0 border-b border-solo-rule rounded-none px-0 py-4 text-xl font-body placeholder:text-solo-text-muted/50 focus-visible:ring-0 focus-visible:border-solo-accent transition-colors min-h-[100px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-8 flex flex-col gap-4">
                      <button 
                        type="submit"
                        className="group flex items-center gap-4 text-solo-text hover:text-solo-accent transition-colors"
                      >
                        <span className="font-display italic text-2xl">[ send ]</span>
                        <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                      </button>
                      <p className="font-body text-sm text-solo-text-muted/60">
                        We'll be in touch within 24 hours.
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
