'use client';
import { T } from '@/components/preferences';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const VarMode = dynamic(() => import('@/components/var-mode'), { ssr: false });
const TacticalBoard = dynamic(() => import('@/components/tactical-board'), { ssr: false });
const RetroPlayer = dynamic(() => import('@/components/retro-player'), { ssr: false });

const pantones = [
    { code: '19-4052', name: 'Classic Blue', hex: '#0F4C81' },
    { code: '16-1546', name: 'Living Coral', hex: '#FF6F61' },
    { code: '18-3838', name: 'Ultra Violet', hex: '#5F4B8B' },
    { code: '15-0343', name: 'Greenery', hex: '#88B04B' },
    { code: '13-1520', name: 'Rose Quartz', hex: '#F7CAC9' },
    { code: '15-3919', name: 'Serenity', hex: '#91A8D0' },
    { code: '17-5104', name: 'Ultimate Gray', hex: '#939597' },
    { code: '13-0647', name: 'Illuminating', hex: '#F5DF4D' },
    { code: '17-3938', name: 'Very Peri', hex: '#6667AB' },
    { code: '18-1750', name: 'Viva Magenta', hex: '#BE3455' },
    { code: '13-1023', name: 'Peach Fuzz', hex: '#FFBE98' },
];

export function SiteFooter() {
    const [varMode, setVarMode] = useState(false);
    const [tacticalMode, setTacticalMode] = useState(false);
    const [pixelRunner, setPixelRunner] = useState(false);
    const [fabricMode, setFabricMode] = useState(false);
    const [isNightMatch, setIsNightMatch] = useState(false);

    useEffect(() => {
        setIsNightMatch(new Date().getHours() >= 20 || new Date().getHours() < 5);
        let sequence = '';
        const keydown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                sequence += e.key;
            } else {
                sequence += e.key.toLowerCase();
            }
            if (sequence.length > 50) sequence = sequence.slice(-50);

            if (sequence.endsWith('var')) setVarMode(v => !v);
            if (sequence.endsWith('tactic')) setTacticalMode(v => !v);
            if (sequence.endsWith('ArrowUpArrowUpArrowDownArrowDown')) setPixelRunner(true);
        };
        window.addEventListener('keydown', keydown);
        return () => window.removeEventListener('keydown', keydown);
    }, []);

    const now = new Date();
    const tzDate = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const startOfYear = new Date(Date.UTC(tzDate.getUTCFullYear(), 0, 0));
    const diff = tzDate.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const todayPantone = pantones[dayOfYear % pantones.length];

    return <footer className="site-footer">
        <div className="footer-top">
            <a className="wordmark" href="/" aria-label="KRM Design home">
                <Image src="/krmIconLightMode.png" alt="" width={140} height={48} className="logo-img logo-light" />
                <Image src="/krmIconDarkMode.png" alt="" width={140} height={48} className="logo-img logo-dark" />
            </a>
            <nav aria-label="Footer navigation">
                <a href="/"><T>{"Home"}</T></a>
                <a href="/projects"><T>{"Portfolio"}</T></a>
                <a href="/world"><T>{"The Archive"}</T></a>
                <a href="/about"><T>{"About"}</T></a>
                <a href="/info"><T>{"Working together"}</T></a>
                <a href="/contact"><T>{"Contact"}</T></a>
            </nav>
        </div>
        <div className="footer-bottom" style={{ flexWrap: 'wrap', gap: '20px' }}>
            <span>© 2026 KRM Design</span>
            <span onClick={() => setFabricMode(v => !v)} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} title="Toggle Fabric Texture"><T>{"Football × Fashion × Culture"}</T></span>
            <div
                onClick={() => {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    if (currentTheme === 'pantone') {
                        document.documentElement.style.removeProperty('--paper');
                        document.documentElement.style.removeProperty('--ink');
                        document.documentElement.style.removeProperty('--line');
                        document.documentElement.style.removeProperty('--acid');
                        document.documentElement.style.removeProperty('--acid-contrast');
                        const prevTheme = document.cookie.includes('krm-theme=dark') ? 'dark' : 'light';
                        document.documentElement.setAttribute('data-theme', prevTheme);
                        document.cookie = `krm-theme=${prevTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
                        return;
                    }
                    const getContrastColor = (hex) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                        return (yiq >= 128) ? '#101010' : '#f2f0ea';
                    };
                    const hex = todayPantone.hex;
                    const ink = getContrastColor(hex);
                    const setOverride = (k, v) => document.documentElement.style.setProperty(k, v);

                    setOverride('--paper', hex);
                    setOverride('--ink', ink);
                    setOverride('--line', ink === '#101010' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)');
                    setOverride('--acid', ink);
                    setOverride('--acid-contrast', ink === '#101010' ? '#f2f0ea' : '#101010');

                    document.documentElement.setAttribute('data-theme', 'pantone');
                    document.cookie = 'krm-theme=pantone; Path=/; Max-Age=31536000; SameSite=Lax';
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'grab', userSelect: 'none' }}
                title="Click to toggle theme"
            >
                <span style={{ color: 'var(--ink)', opacity: 0.7 }}>Color of the day</span>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: todayPantone.hex }}></div>
                <span style={{ color: todayPantone.hex, fontWeight: 'bold' }}>PANTONE {todayPantone.code} {todayPantone.name}</span>
            </div>
            <a href="https://instagram.com/krmdesign" target="_blank" rel="noopener noreferrer" aria-label="KRM Design Instagram"><T>{"Instagram ↗"}</T></a>
        </div>
        {varMode && <VarMode />}
        {tacticalMode && <TacticalBoard onClose={() => setTacticalMode(false)} />}
        {pixelRunner && <RetroPlayer onComplete={() => setPixelRunner(false)} />}
        {isNightMatch && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50vh', pointerEvents: 'none', zIndex: 99999, background: 'radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.4) 0%, transparent 60%), radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.4) 0%, transparent 60%)', mixBlendMode: 'overlay', opacity: 0.8 }} />
        )}
        {fabricMode && (
            <style>{`
                body {
                    background-image: radial-gradient(var(--line) 1px, transparent 1px) !important;
                    background-size: 8px 8px !important;
                    background-color: var(--paper) !important;
                }
                * {
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.2) !important;
                }
            `}</style>
        )}
    </footer>;
}
