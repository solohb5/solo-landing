export function Footer() {
  return (
    <footer className="px-6 md:px-12 max-w-[1400px] mx-auto py-20 md:py-32">
      
      {/* Divider */}
      <div className="h-[1px] w-full bg-solo-rule mb-16 md:mb-24" />
      
      {/* Main Footer Content - Editorial Layout */}
      <div className="flex flex-col">
        
        {/* Top: Tagline left, SOLO logo right - vertically centered */}
        <div className="flex items-center justify-between py-8 md:py-12">
          {/* Left side - tagline stacked */}
          <div className="hidden md:flex flex-col items-start gap-1">
            <span className="font-body text-sm uppercase tracking-[0.15em] text-solo-text-muted">
              Premium websites
            </span>
            <span className="font-body text-sm uppercase tracking-[0.15em] text-solo-text-muted">
              for personal brands
            </span>
          </div>
          
          {/* Right side - SOLO with pulsing square */}
          <div className="flex items-center gap-4 md:gap-6">
            <span className="font-display font-medium text-5xl md:text-7xl lg:text-8xl tracking-tight text-solo-text leading-none">
              SOLO
            </span>
            <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-solo-accent animate-heartbeat" />
          </div>
        </div>
        
        {/* Thin rule */}
        <div className="h-[1px] w-full bg-solo-rule opacity-30" />
        
        {/* Three columns - compact */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 md:gap-x-16 gap-y-4 pt-8 md:pt-12">
          
          {/* Column 1: Location */}
          <div className="flex flex-col gap-1">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-solo-accent">
              Based in
            </span>
            <span className="font-body text-sm text-solo-text">
              LA / NY
            </span>
          </div>
          
          {/* Column 2: Copyright (center) */}
          <div className="flex flex-col gap-1">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-solo-accent">
              © {new Date().getFullYear()}
            </span>
            <span className="font-body text-sm text-solo-text whitespace-nowrap">
              Solo Designs
            </span>
          </div>
          
          {/* Column 3: Contact (right) */}
          <div className="flex flex-col gap-1 col-span-2 md:col-span-1 mt-4 md:mt-0">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-solo-accent">
              Say hello
            </span>
            <a 
              href="mailto:hello@solodesigns.co" 
              className="font-body text-sm text-solo-text hover:text-solo-accent transition-colors"
            >
              hello@solodesigns.co
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
