'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFontSize, FONT_CONFIGS, FontSize } from '@/lib/font-size';
import { useTheme, Theme } from '@/lib/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSnackbar } from '@/components/ui/Snackbar';

interface ProfileScreenProps {
  onBack?: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);
  const { fontSize, setFontSize, fontConfig } = useFontSize();
  const { theme, setTheme } = useTheme();
  const { showSnackbar } = useSnackbar();
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
        showSnackbar('Záloha uložena ✓');
      } else {
        showSnackbar('Záloha selhala');
      }
    } catch { showSnackbar('Záloha selhala'); }
    finally { setBackingUp(false); }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const res = await fetch('/api/backup', { method: 'PUT' });
      if (res.ok) {
        window.dispatchEvent(new Event('idea-updated'));
        showSnackbar('Data obnovena ✓');
      } else {
        showSnackbar('Obnova selhala');
      }
    } catch { showSnackbar('Obnova selhala'); }
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
              className="p-2 rounded-lg bg-slate-800/50 theme-text-muted hover:text-white transition-colors"
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
        <div className="p-4 theme-card rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-14 h-14 rounded-full border-2 theme-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center text-xl font-bold text-violet-400">
                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold theme-text">{user.user_metadata?.full_name || 'Uživatel'}</p>
              <p className="text-sm theme-text-muted">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-2">
        {/* AI Agent status */}
        <div className="p-3 theme-card rounded-xl flex items-center justify-between">
          <span className="text-sm theme-text-secondary">AI Agent</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-400">Aktivní</span>
          </div>
        </div>

        {/* Font Size */}
        <div className="p-4 theme-card rounded-xl">
          <p className="text-sm theme-text font-medium mb-3">Velikost textu zpráv</p>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as FontSize[]).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all ${
                  fontSize === size
                    ? 'bg-violet-500/20 border border-violet-500/50 text-violet-400'
                    : 'theme-bg-input border theme-border theme-text-muted hover:text-white'
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
          <div className="mt-3 p-3 theme-bg-muted rounded-lg border theme-border">
            <p className={`${fontConfig.title} theme-text font-medium`}>Ukázka nadpisu zprávy</p>
            <p className={`${fontConfig.body} theme-text-muted mt-1`}>Toto je ukázka textu, jak bude vypadat ve feedu.</p>
          </div>
        </div>

        <div className="p-3 theme-card rounded-xl flex items-center justify-between">
          <span className="text-sm theme-text-secondary">Jazyk</span>
          <span className="text-sm theme-text-muted">Čeština</span>
        </div>

        {/* Theme selector */}
        <div className="p-4 theme-card rounded-xl">
          <p className="text-sm theme-text font-medium mb-3">Téma</p>
          <div className="flex gap-2">
            {(['dark', 'light', 'system'] as Theme[]).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all ${
                  theme === t
                    ? 'bg-violet-500/20 border border-violet-500/50 text-violet-400'
                    : 'theme-bg-input border theme-border theme-text-muted hover:text-white'
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
        <div className="p-3 theme-card rounded-xl flex items-center justify-between">
          <span className="text-sm theme-text-secondary">Verze</span>
          <span className="text-sm theme-text-muted">1.0.0</span>
        </div>

        {/* Google Drive Backup */}
        <div className="p-4 theme-card rounded-xl">
          <p className="text-sm theme-text font-medium mb-1">Google Drive Záloha</p>
          {backupInfo.lastBackup && (
            <p className="text-xs theme-text-muted mb-3">
              Poslední záloha: {new Date(backupInfo.lastBackup).toLocaleString('cs-CZ')}
            </p>
          )}
          {!backupInfo.lastBackup && (
            <p className="text-xs theme-text-muted mb-3">Zatím žádná záloha</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleBackup}
              disabled={backingUp}
              className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-violet-500/20 border border-violet-500/50 text-violet-400 hover:bg-violet-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {backingUp ? 'Zálohuji...' : 'Zálohovat'}
            </button>
            <button
              onClick={handleRestore}
              disabled={restoring || !backupInfo.exists}
              className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium theme-bg-input border theme-border theme-text-secondary hover:text-white active:scale-95 transition-all disabled:opacity-50"
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
        <p className="text-xs theme-text-faint">DecisionUp v1.0</p>
        <p className="text-[10px] text-slate-700 mt-0.5">Signal, not noise.</p>
      </div>
      </div>
    </div>
  );
}
