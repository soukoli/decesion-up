'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'sm' | 'md' | 'lg';

export interface FontConfig {
  title: string;
  body: string;
  meta: string;
  label: string;
  labelCz: string;
}

export const FONT_CONFIGS: Record<FontSize, FontConfig> = {
  sm: {
    title: 'text-sm leading-snug',
    body: 'text-xs leading-relaxed',
    meta: 'text-[10px]',
    label: 'Compact',
    labelCz: 'Kompaktní',
  },
  md: {
    title: 'text-base leading-relaxed tracking-wide',
    body: 'text-sm leading-relaxed',
    meta: 'text-[11px]',
    label: 'Default',
    labelCz: 'Výchozí',
  },
  lg: {
    title: 'text-lg leading-relaxed tracking-wide',
    body: 'text-base leading-relaxed',
    meta: 'text-xs',
    label: 'Large',
    labelCz: 'Velké',
  },
};

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontConfig: FontConfig;
}

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: 'md',
  setFontSize: () => {},
  fontConfig: FONT_CONFIGS.md,
});

const STORAGE_KEY = 'decisionup-font-size';

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('md');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    if (stored && FONT_CONFIGS[stored]) {
      setFontSizeState(stored);
    }
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY, size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, fontConfig: FONT_CONFIGS[fontSize] }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
