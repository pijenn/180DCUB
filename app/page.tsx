import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="text-center max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
          Empowering Your <span className="text-primary">Future</span>
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/product" 
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-primary-foreground bg-primary rounded-full overflow-hidden transition-all hover:scale-105"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">
              Explore Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link 
            href="/about" 
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-foreground bg-transparent border-2 border-border rounded-full hover:bg-muted transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
