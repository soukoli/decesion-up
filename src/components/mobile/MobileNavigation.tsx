'use client';

import React from 'react';

interface MobileNavigationProps {
  activeIndex: number;
  onNavigate: (index: number) => void;
}

const navItems = [
  {
    id: 'home',
    // Lightning bolt - briefing/home
    iconOutline: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L10.5 21.75 12 13.5H3.75z" />
      </svg>
    ),
    iconFilled: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'feed',
    // Newspaper - feed/content
    iconOutline: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    iconFilled: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M4.125 3a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 004.125 21h15.75a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.875 3H4.125zM6 6.75h3v3H6v-3zm10.5.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm-7.5 3.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H9zm0 3a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'notes',
    // Light bulb - ideas/notes
    iconOutline: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    iconFilled: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25A6.75 6.75 0 005.25 9c0 2.485 1.5 4.609 3.636 5.578.39.178.614.55.614.95V18h5v-2.472c0-.4.224-.772.614-.95A6.75 6.75 0 0012 2.25zM9.75 19.5h4.5v.75a2.25 2.25 0 01-4.5 0v-.75z" />
      </svg>
    ),
  },
];

export function MobileNavigation({ activeIndex, onNavigate }: MobileNavigationProps) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 shadow-2xl shadow-black/40">
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(index)}
              className={`relative p-3 rounded-full transition-all duration-300 ease-out ${
                isActive
                  ? 'text-amber-400 bg-amber-500/15 scale-110 shadow-lg shadow-amber-500/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 scale-100'
              }`}
            >
              {isActive ? item.iconFilled : item.iconOutline}
              {/* Active glow ring */}
              {isActive && (
                <span className="absolute inset-0 rounded-full ring-2 ring-amber-400/30 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
