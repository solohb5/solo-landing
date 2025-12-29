import { motion } from "framer-motion";

export function MarqueeDivider() {
  const items = [
    'BRAND STRATEGY',
    'WEB DESIGN',
    'COPYWRITING',
    'VISUAL IDENTITY',
    'DIGITAL PRESENCE',
    'STORYTELLING'
  ];

  // Triple for seamless loop
  const tripled = [...items, ...items, ...items];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="relative overflow-hidden py-6 md:py-8 border-y border-solo-rule"
    >
      <div className="flex animate-marquee w-max">
        {tripled.map((item, i) => (
          <div key={i} className="flex items-center gap-8 md:gap-16 px-8 md:px-16">
            <span className="font-display italic text-lg md:text-2xl tracking-wide text-solo-text-muted opacity-50 whitespace-nowrap">
              {item}
            </span>
            <span className="w-2 h-2 bg-solo-accent/40 rotate-45" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
