'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { translate, locales } from '@/lib/translations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const Context = createContext({ locale: 'en', theme: 'light', setLocale: (_v) => { }, toggleTheme: (_x, _y) => { }, changing: false, ready: false });
export function Preferences({ children, initialLocale, initialTheme }) {
    const [locale, setLanguage] = useState(initialLocale), [theme, setTheme] = useState(initialTheme), [veil, setVeil] = useState(null);
    const timers = useRef([]);
    const [ready, setReady] = useState(false);
    useEffect(() => { setReady(true) }, []);
    useEffect(() => () => timers.current.forEach(clearTimeout), []);
    function setLocale(value) { setLanguage(value); document.documentElement.lang = value; document.cookie = `krm-language=${value}; Path=/; Max-Age=31536000; SameSite=Lax`; }
    function toggleTheme(x, y) {
        if (veil)
            return; const next = theme === 'dark' ? 'light' : 'dark'; const apply = () => {
                setTheme(next); document.documentElement.dataset.theme = next; document.cookie = `krm-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
                document.documentElement.style.removeProperty('--paper');
                document.documentElement.style.removeProperty('--ink');
                document.documentElement.style.removeProperty('--line');
                document.documentElement.style.removeProperty('--acid');
            }; if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
                apply();
                return;
            } setVeil({ x, y, theme: next }); timers.current.push(setTimeout(() => flushSync(apply), 200), setTimeout(() => setVeil(null), 400));
    }
    return <Context.Provider value={{ locale, theme, setLocale, toggleTheme, changing: !!veil, ready }}>{children}{veil && <div aria-hidden="true" className={'theme-veil ' + veil.theme} style={{ '--iris-x': veil.x + 'px', '--iris-y': veil.y + 'px' }} />}</Context.Provider>;
}
export function usePreferences() { const context = useContext(Context); return { ...context, t: (s) => translate(s, context.locale) }; }
export function T({ children }) { const { t } = usePreferences(); return <>{typeof children === 'string' ? t(children) : children}</>; }
export function PreferenceControls() { const { locale, setLocale, theme, toggleTheme, changing, t } = usePreferences(); return <div className="preference-controls"><div className="language-control"><span className="sr-only">{t('Language')}</span><Select value={locale} onValueChange={setLocale}><SelectTrigger aria-label={t('Language')} className="language-select-trigger"><SelectValue placeholder="Language" /></SelectTrigger><SelectContent>{locales.map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}</SelectContent></Select></div><button className="theme-toggle" disabled={changing} aria-label={t(theme === 'light' ? 'Dark mode' : 'Light mode')} title={t(theme === 'light' ? 'Dark mode' : 'Light mode')} aria-pressed={theme === 'dark'} onClick={e => { const b = e.currentTarget.getBoundingClientRect(); toggleTheme(b.left + b.width / 2, b.top + b.height / 2); }}>{theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>}<span className="sr-only">{t(theme === 'light' ? 'Dark mode' : 'Light mode')}</span></button></div>; }
