import React from 'react';
import { AR } from './utils';

interface CounterBadgeProps {
  label: string;
  value: string;
  lang: 'ar' | 'en';
}

export function CounterBadge({ label, value, lang }: CounterBadgeProps) {
  return (
    <div className="flex flex-col items-center px-4 py-3 min-w-[64px] bg-[#111]/80 rounded-xl shadow-lg">
      <span
        className="text-3xl sm:text-4xl font-extrabold text-white leading-none"
        style={{ fontFamily: AR(lang) }}
      >
        {value}
      </span>
      <span
        className="text-xs sm:text-sm text-white/50 uppercase tracking-widest mt-1"
        style={{ fontFamily: AR(lang) }}
      >
        {label}
      </span>
    </div>
  );
}
