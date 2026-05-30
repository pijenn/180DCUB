import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  name: string;
  role: string;
  imageUrl: string;
  className?: string;
}

export function TeamMemberCard({ name, role, imageUrl, className }: TeamMemberCardProps) {
  return (
    <div className={cn("group relative flex flex-col items-center", className)}>
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-2xl glass-panel">
        <Image 
          src={imageUrl} 
          alt={name} 
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="text-center space-y-1 z-10">
        <h4 className="text-lg font-bold text-foreground group-hover:text-[var(--color-primary)] transition-colors">
          {name}
        </h4>
        <p className="text-sm text-muted-foreground font-medium">
          {role}
        </p>
      </div>
    </div>
  );
}
