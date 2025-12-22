import { motion } from "framer-motion";

export function Marquee() {
  const items = ['speakers', 'coaches', 'creators', 'podcasters', 'founders', 'authors'];
  
  // Double the array for seamless loop
  const doubled = [...items, ...items, ...items, ...items];
  
  return (
    <div className="relative overflow-hidden py-4 w-[800px] md:w-[1200px] bg-solo-accent/10 border-y border-solo-accent/20 backdrop-blur-sm">
      <div className="marquee-track flex animate-marquee w-max">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-12 px-12">
            <span className="font-body text-[14px] uppercase tracking-[0.2em] text-solo-text-muted opacity-80 whitespace-nowrap">
              {item}
            </span>
            <span className="w-1.5 h-1.5 bg-solo-accent animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
