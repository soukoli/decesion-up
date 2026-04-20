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

interface SettingsContextType {
  // ACLED
  acledCredentials: ACLEDCredentials | null;
  acledTokens: ACLEDTokens | null;
  setAcledCredentials: (creds: ACLEDCredentials | null) => void;
  setAcledTokens: (tokens: ACLEDTokens | null) => void;
  isAcledConfigured: boolean;
  isAcledTokenValid: boolean;
  
  // Settings UI
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_CREDENTIALS = 'decisionup_acled_creds';
const STORAGE_KEY_TOKENS = 'decisionup_acled_tokens';

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
