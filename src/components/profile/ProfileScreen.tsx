'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFontSize, FONT_CONFIGS, FontSize } from '@/lib/font-size';
import { useTheme, Theme } from '@/lib/theme';
import { PageHeader } from '@/components/ui/PageHeader';

interface ProfileScreenProps {
  onBack?: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);
  const { fontSize, setFontSize, fontConfig } = useFontSize();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const [backupInfo, setBackupInfo] = useState<{ exists: boolean; lastBackup: string | null }>({ exists: false, lastBackup: null });
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchBackupInfo();
  }, []);

  const fetchBackupInfo = async () => {
    try {
      const res = await fetch('/api/backup');
      if (res.ok) setBackupInfo(await res.json());
    } catch { /* silent */ }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      if (res.ok) {
        await fetchBackupInfo();
      } else {
        const data = await res.json();
        console.error('Backup failed:', data);
        alert(data.error || 'Backup failed');
      }
    } catch (e) { console.error('Backup error:', e); }
    finally { setBackingUp(false); }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const res = await fetch('/api/backup', { method: 'PUT' });
      if (res.ok) {
        window.dispatchEvent(new Event('idea-updated'));
      }
    } catch { /* silent */ }
    finally { setRestoring(false); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-6">
      <PageHeader
        title="Profil"
        rightContent={
          onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )
        }
      />

      <div className="px-4 space-y-6">

      {/* User card */}
      {user && (
        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-14 h-14 rounded-full border-2 border-slate-700"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-xl font-bold text-amber-400">
                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-white">{user.user_metadata?.full_name || 'Uživatel'}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-2">
        {/* AI Agent status */}
        <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-slate-300">AI Agent</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-400">Aktivní</span>
          </div>
        </div>

        {/* Font Size */}
        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <p className="text-sm text-white font-medium mb-3">Velikost textu zpráv</p>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as FontSize[]).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all ${
                  fontSize === size
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <span className={`block ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} font-medium`}>
                  Aa
                </span>
                <span className="text-[10px] mt-0.5 block opacity-70">
                  {FONT_CONFIGS[size].labelCz}
                </span>
              </button>
            ))}
          </div>
          {/* Preview */}
          <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className={`${fontConfig.title} text-white font-medium`}>Ukázka nadpisu zprávy</p>
            <p className={`${fontConfig.body} text-slate-400 mt-1`}>Toto je ukázka textu, jak bude vypadat ve feedu.</p>
          </div>
        </div>

        <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-slate-300">Jazyk</span>
          <span className="text-sm text-slate-500">Čeština</span>
        </div>

        {/* Theme selector */}
        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <p className="text-sm text-white font-medium mb-3">Téma</p>
          <div className="flex gap-2">
            {(['dark', 'light', 'system'] as Theme[]).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all ${
                  theme === t
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-lg mb-0.5">
                  {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'}
                </span>
                <span className="text-[11px]">
                  {t === 'dark' ? 'Tmavé' : t === 'light' ? 'Světlé' : 'Systém'}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-slate-300">Verze</span>
          <span className="text-sm text-slate-500">1.0.0</span>
        </div>

        {/* Google Drive Backup */}
        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <p className="text-sm text-white font-medium mb-1">Google Drive Záloha</p>
          {backupInfo.lastBackup && (
            <p className="text-xs text-slate-500 mb-3">
              Poslední záloha: {new Date(backupInfo.lastBackup).toLocaleString('cs-CZ')}
            </p>
          )}
          {!backupInfo.lastBackup && (
            <p className="text-xs text-slate-500 mb-3">Zatím žádná záloha</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleBackup}
              disabled={backingUp}
              className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {backingUp ? 'Zálohuji...' : 'Zálohovat'}
            </button>
            <button
              onClick={handleRestore}
              disabled={restoring || !backupInfo.exists}
              className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white active:scale-95 transition-all disabled:opacity-50"
            >
              {restoring ? 'Obnovuji...' : 'Obnovit'}
            </button>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full mt-8 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-sm hover:bg-red-500/20 active:scale-[0.98] transition-all"
      >
        Odhlásit se
      </button>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600">DecisionUp v1.0</p>
        <p className="text-[10px] text-slate-700 mt-0.5">Signal, not noise.</p>
      </div>
      </div>
    </div>
  );
}
