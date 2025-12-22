import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface Project {
  name: string;
  role: string;
  year: string;
  services: string;
  screenshot: string;
  url: string;
}

const projects: Project[] = [
  {
    name: "Jovanny Jones",
    role: "Executive Coach",
    year: "2024",
    services: "Brand / Web / Copy",
    screenshot: "/jovanny-screenshot.png",
    url: "https://jovannyjones.com"
  }
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.a 
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-[85vw] md:w-[480px] flex-shrink-0 cursor-none"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Browser Frame */}
      <div className="w-full aspect-[4/3] bg-[#111] rounded-lg overflow-hidden border border-white/10 relative mb-6">
        {/* Browser Dots */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
        
        {/* Screenshot Container */}
        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]">
          {/* Grayscale Version (Default) */}
          <img 
            src={project.screenshot} 
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-100 group-hover:opacity-0 transition-opacity duration-500"
          />
          {/* Color Version (Hover) */}
          <img 
            src={project.screenshot} 
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
          
          {/* Overlay for better text contrast if needed, but we're doing outside text */}
        </div>

        {/* Hover Arrow Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-solo-accent/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500 delay-100">
            <ArrowUpRight className="text-solo-bg w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-wider text-solo-text-muted">
        <div className="flex justify-between items-baseline border-b border-solo-rule pb-2">
          <span className="text-solo-text font-bold text-sm group-hover:text-solo-accent transition-colors">{project.name}</span>
          <span>{project.year}</span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span>{project.role}</span>
          <span>{project.services}</span>
        </div>
      </div>
    </motion.a>
  );
}

function PlaceholderCard({ onOpenProject }: { onOpenProject?: () => void }) {
  return (
    <motion.div 
      className="group block w-[85vw] md:w-[480px] flex-shrink-0 cursor-pointer"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpenProject}
    >
      <div className="w-full aspect-[4/3] bg-[#0A0A0A] rounded-lg overflow-hidden border border-white/5 relative mb-6 flex flex-col items-center justify-center gap-6 group-hover:border-solo-accent/30 transition-colors duration-500">
        <span className="font-display italic text-3xl text-solo-text-muted group-hover:text-solo-text transition-colors text-center px-8">
          Your page could be here
        </span>
        <div className="w-3 h-3 bg-solo-accent animate-heartbeat" />
        
        <div className="absolute inset-0 bg-solo-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-wider text-solo-text-muted opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="flex justify-between items-baseline border-b border-solo-rule pb-2">
          <span className="text-solo-text font-bold text-sm">[ Reserve Spot ]</span>
          <span>2025</span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span>Your Vision</span>
          <span>Our Craft</span>
        </div>
      </div>
    </motion.div>
  );
}

interface ProjectGalleryProps {
  onOpenProject?: () => void;
}

export function ProjectGallery({ onOpenProject }: ProjectGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  
  return (
    <div className="w-full relative">
      {/* Scroll Container */}
      <div 
        ref={containerRef}
        className="flex gap-8 md:gap-12 overflow-x-auto pb-12 pt-4 px-6 md:px-0 snap-x snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {projects.map((project, i) => (
          <div key={i} className="snap-center first:pl-0 last:pr-[33vw]">
            <ProjectCard project={project} />
          </div>
        ))}
        
        <div className="snap-center pr-6 md:pr-12">
          <PlaceholderCard onOpenProject={onOpenProject} />
        </div>
      </div>

      {/* Progress Bar (Optional but nice) */}
      <div className="w-full h-[1px] bg-solo-rule mt-8 relative overflow-hidden max-w-md">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-solo-accent"
          style={{ scaleX: scrollXProgress, originX: 0 }}
        />
      </div>
    </div>
  );
}
