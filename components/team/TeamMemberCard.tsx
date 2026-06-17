import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TeamMemberCardProps {
  name: string;
  role: string;
  imageUrl: string;
  className?: string;
  linkedinUrl?: string;
}

export function TeamMemberCard({ name, role, imageUrl, className, linkedinUrl }: TeamMemberCardProps) {
  const content = (
    <div className={cn("group relative flex flex-col items-center cursor-pointer", className)}>
      <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-none border border-white/10">
        <Image 
          src={imageUrl} 
          alt={name} 
          fill
          className="object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
      </div>
      <div className="text-center space-y-2 z-10 w-full">
        <h4 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors duration-300 truncate px-2">
          {name}
        </h4>
        <p className="text-sm text-white/50 tracking-widest uppercase font-medium">
          {role}
        </p>
      </div>
    </div>
  );

  if (linkedinUrl) {
    return (
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
