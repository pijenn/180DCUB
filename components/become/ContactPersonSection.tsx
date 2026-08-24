'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function ContactPersonSection() {
  const contactPersons = [
    {
      name: 'Verdi',
      role: 'Contact Person',
      whatsappUrl: 'https://wa.me/6287715714146',
      numberDisplay: '+62 877-1571-4146',
    },
    {
      name: 'Armand',
      role: 'Contact Person',
      whatsappUrl: 'https://wa.me/6282132330703',
      numberDisplay: '+62 821-3233-0703',
    },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[var(--color-primary)] text-black">
      {/* Noise background texture matching home section */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
        <span className="text-xs sm:text-sm tracking-[0.3em] uppercase font-black text-black/70 mb-4 bg-black/10 px-4 py-1.5 rounded-full">
          Get in Touch
        </span>

        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.95] mb-6 max-w-5xl text-black">
          Still Curious about <br /> Become 180? <br />
        </h2>

        {/* Contact Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl">
          {contactPersons.map((person) => (
            <Link
              key={person.name}
              href={person.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto flex-1 flex items-center justify-between sm:justify-center gap-4 bg-black text-white px-8 py-5 rounded-full text-xl font-bold hover:scale-105 hover:bg-neutral-900 transition-all duration-300 shadow-2xl shadow-black/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <span>Chat with {person.name}</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] group-hover:animate-ping shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
