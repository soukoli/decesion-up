'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSettings } from '@/lib/settings';
import { useTranslation } from '@/lib/translation';

export function SettingsModal() {
  const { 
    isSettingsOpen, 
    closeSettings, 
    acledCredentials, 
    setAcledCredentials,
    acledTokens,
    setAcledTokens,
    isAcledConfigured,
    isAcledTokenValid,
  } = useSettings();
  const { language } = useTranslation();

  const [email, setEmail] = useState(acledCredentials?.email || '');
  const [password, setPassword] = useState(acledCredentials?.password || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    if (!email || !password) {
      setError(language === 'cs' ? 'Vyplňte email a heslo' : 'Please fill in email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Try to get token to validate credentials
      const response = await fetch('/api/acled/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save credentials
      setAcledCredentials({ email, password });
      
      // Save tokens
      setAcledTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      });

      setSuccess(language === 'cs' ? 'Přihlášení úspěšné!' : 'Authentication successful!');
    } catch (err: any) {
      setError(err.message || (language === 'cs' ? 'Chyba přihlášení' : 'Authentication error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAcledCredentials(null);
    setAcledTokens(null);
    setEmail('');
    setPassword('');
    setSuccess(language === 'cs' ? 'Odhlášeno' : 'Logged out');
  };

  const formatTokenExpiry = () => {
    if (!acledTokens?.expiresAt) return null;
    const expiresAt = new Date(acledTokens.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs <= 0) {
      return language === 'cs' ? 'Vypršel' : 'Expired';
    }
    
    return `${diffHours}h ${diffMins}m`;
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeSettings()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/icon.png"
                  alt="DecisionUp"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h2 className="text-lg font-bold text-white">
                  {language === 'cs' ? 'Nastavení' : 'Settings'}
                </h2>
              </div>
              <button
                onClick={closeSettings}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* ACLED Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-white">ACLED</h3>
                  <span className="text-[10px] text-slate-500">
                    {language === 'cs' ? 'Data o konfliktech' : 'Conflict data'}
                  </span>
                  {isAcledConfigured && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                      isAcledTokenValid 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isAcledTokenValid 
                        ? (language === 'cs' ? 'Připojeno' : 'Connected')
                        : (language === 'cs' ? 'Token vypršel' : 'Token expired')
                      }
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  {language === 'cs' 
                    ? 'Pro data o konfliktech a protestech potřebujete ACLED účet. Registrace zdarma na acleddata.com'
                    : 'For conflict and protest data, you need an ACLED account. Free registration at acleddata.com'
                  }
                </p>

                {/* Email */}
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'cs' ? 'Heslo' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Token Status */}
                {isAcledConfigured && acledTokens && (
                  <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {language === 'cs' ? 'Token vyprší za' : 'Token expires in'}:
                      </span>
                      <span className={isAcledTokenValid ? 'text-green-400' : 'text-red-400'}>
                        {formatTokenExpiry()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-400">{success}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading 
                      ? (language === 'cs' ? 'Ověřuji...' : 'Verifying...')
                      : (language === 'cs' ? 'Uložit a ověřit' : 'Save & Verify')
                    }
                  </button>
                  {isAcledConfigured && (
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors"
                    >
                      {language === 'cs' ? 'Odhlásit' : 'Logout'}
                    </button>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2">
                  {language === 'cs' ? 'Datové zdroje' : 'Data Sources'}
                </h3>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>GDACS</span>
                    <span className="text-green-400">{language === 'cs' ? 'Aktivní' : 'Active'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>USGS {language === 'cs' ? 'Zemětřesení' : 'Earthquakes'}</span>
                    <span className="text-green-400">{language === 'cs' ? 'Aktivní' : 'Active'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ACLED {language === 'cs' ? 'Konflikty' : 'Conflicts'}</span>
                    <span className={isAcledConfigured && isAcledTokenValid ? 'text-green-400' : 'text-slate-600'}>
                      {isAcledConfigured && isAcledTokenValid 
                        ? (language === 'cs' ? 'Aktivní' : 'Active')
                        : (language === 'cs' ? 'Vyžaduje přihlášení' : 'Requires login')
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* App Info */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-600">
                  DecisionUp v1.0
                </p>
                <p className="text-[10px] text-slate-700 mt-1">
                  Signal, not noise
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
