import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Clients", href: "#" },
    { name: "Store", href: "/product" },
    { name: "Event", href: "#" },
    { name: "Academy", href: "#" },
    { name: "Telescope", href: "#" },
  ];

  return (
    <footer className="bg-[#111111] border-t-2 border-[var(--color-primary)] text-white/80 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        <div className="flex items-start">
          <Image 
            src="/assets/Logo 180 green-white.png" 
            alt="180DC UB Logo" 
            width={180} 
            height={180} 
            className="w-32 md:w-48 object-contain"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Office</h3>
          <p className="text-sm leading-relaxed max-w-xs">
            180 Degrees Consulting UB<br />
            Location<br />
            Jl. Veteran No.10-11, Ketawanggede, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145
          </p>
          <a href="mailto:ub@180dc.org" className="text-sm hover:text-[var(--color-primary)] transition-colors">
            ub@180dc.org
          </a>
        </div>



        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Let's Stay Connected</h3>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.instagram.com/180dcub/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[var(--color-primary)] transition-colors"
            >
              <Image src="/assets/instagram.svg" alt="Instagram" width={20} height={20} />
            </a>
            <a 
              href="https://www.linkedin.com/company/180dc-ub/posts/?feedView=all" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-[var(--color-primary)] transition-colors"
            >
              <Image src="/assets/linkedin.svg" alt="LinkedIn" width={20} height={20} />
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
        <p>© 2026 by 180 Degrees Consulting UB</p>
      </div>
    </footer>
  );
}
