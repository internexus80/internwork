import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  href?: string;
  subtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', href = '/', subtitle = true }) => {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/assets/internjourneys-monogram.png"
          alt=""
          width={72}
          height={72}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] leading-tight flex items-center">
          Intern<span className="text-[#3b82f6]">Journeys</span>
        </span>
        {subtitle && (
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider">
            Learn • Build • Get Hired
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
