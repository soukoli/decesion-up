'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ACLEDCredentials {
  email: string;
  password: string;
}

interface ACLEDTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
}

// Font size options
export type FontSize = 'small' | 'medium' | 'large';

export const FONT_SIZE_CONFIG = {
  small: {
    label: { en: 'Compact', cs: 'Kompaktní' },
    titleClass: 'text-sm',
    bodyClass: 'text-xs',
    scale: 0.875,
  },
  medium: {
    label: { en: 'Default', cs: 'Výchozí' },
    titleClass: 'text-base',
    bodyClass: 'text-sm',
    scale: 1,
  },
  large: {
    label: { en: 'Large', cs: 'Velké' },
    titleClass: 'text-lg',
    bodyClass: 'text-base',
    scale: 1.125,
  },
} as const;

interface SettingsContextType {
  // ACLED
  acledCredentials: ACLEDCredentials | null;
  acledTokens: ACLEDTokens | null;
  setAcledCredentials: (creds: ACLEDCredentials | null) => void;
  setAcledTokens: (tokens: ACLEDTokens | null) => void;
  isAcledConfigured: boolean;
  isAcledTokenValid: boolean;
  
  // Font size
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  
  // Settings UI
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_CREDENTIALS = 'decisionup_acled_creds';
const STORAGE_KEY_TOKENS = 'decisionup_acled_tokens';
const STORAGE_KEY_FONT_SIZE = 'decisionup_font_size';

// Simple obfuscation (not real encryption, but better than plaintext)
function encode(str: string): string {
  return btoa(encodeURIComponent(str));
}

function decode(str: string): string {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return '';
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [acledCredentials, setAcledCredentialsState] = useState<ACLEDCredentials | null>(null);
  const [acledTokens, setAcledTokensState] = useState<ACLEDTokens | null>(null);
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCreds = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
      if (storedCreds) {
        const decoded = JSON.parse(decode(storedCreds));
        setAcledCredentialsState(decoded);
      }

      const storedTokens = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (storedTokens) {
        const decoded = JSON.parse(decode(storedTokens));
        setAcledTokensState(decoded);
      }

      const storedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
      if (storedFontSize && ['small', 'medium', 'large'].includes(storedFontSize)) {
        setFontSizeState(storedFontSize as FontSize);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    setIsLoaded(true);
  }, []);

  const setAcledCredentials = (creds: ACLEDCredentials | null) => {
    setAcledCredentialsState(creds);
    if (creds) {
      localStorage.setItem(STORAGE_KEY_CREDENTIALS, encode(JSON.stringify(creds)));
    } else {
      localStorage.removeItem(STORAGE_KEY_CREDENTIALS);
    }
  };

  const setAcledTokens = (tokens: ACLEDTokens | null) => {
    setAcledTokensState(tokens);
    if (tokens) {
      localStorage.setItem(STORAGE_KEY_TOKENS, encode(JSON.stringify(tokens)));
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKENS);
    }
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, size);
  };

  const isAcledConfigured = Boolean(acledCredentials?.email && acledCredentials?.password);
  
  const isAcledTokenValid = Boolean(
    acledTokens?.accessToken && 
    acledTokens?.expiresAt && 
    Date.now() < acledTokens.expiresAt
  );

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // Don't render children until loaded to prevent hydration issues
  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        acledCredentials,
        acledTokens,
        setAcledCredentials,
        setAcledTokens,
        isAcledConfigured,
        isAcledTokenValid,
        fontSize,
        setFontSize,
        isSettingsOpen,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
