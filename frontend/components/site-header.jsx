'use client';
import { PreferenceControls, T } from './preferences';
import Link from '@/components/site-link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
const links = [['/', 'Home'], ['/projects', 'Portfolio'], ['/world', 'The Archive'], ['/about', 'About'], ['/info', 'Working together']];
export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = 'hidden';
        const onKey = e => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    }, [open]);
    return <>
        <header className="site-header">
            <Link className="wordmark" href="/" aria-label="KRM Design home">
                <Image src="/krmIconLightMode.png" alt="KRM Design" width={110} height={40} className="logo-img logo-light" priority />
                <Image src="/krmIconDarkMode.png" alt="KRM Design" width={110} height={40} className="logo-img logo-dark" priority />
            </Link>
            <nav aria-label="Main navigation">
                {links.slice(1, 4).map(([href, label]) => <Link key={href} href={href}><T>{label}</T></Link>)}
                <Link href="/info"><T>{"Info"}</T></Link>
            </nav>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Link className="header-cta" href="/contact"><T>{"Start a project ↗"}</T></Link>
                <PreferenceControls />
            </div>
            <button className="hamburger-btn" onClick={() => setOpen(v => !v)} aria-label="Toggle menu" aria-expanded={open}>
                <span className={`hamburger-icon ${open ? 'is-open' : ''}`}>
                    <span /><span /><span />
                </span>
            </button>
        </header>
        {/* Fullscreen mobile drawer */}
        <div className={`mobile-drawer-overlay ${open ? 'is-open' : ''}`} onClick={close} />
        <aside className={`mobile-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
            <div className="mobile-drawer-header">
                <span className="mobile-drawer-title"><T>{"Menu"}</T></span>
                <button className="mobile-drawer-close" onClick={close} aria-label="Close menu">✕</button>
            </div>
            <nav className="mobile-drawer-nav">
                {links.map(([href, label]) => <Link href={href} key={href} onClick={close}><T>{label}</T></Link>)}
                <Link href="/contact" onClick={close} className="mobile-drawer-cta"><T>{"Start a project ↗"}</T></Link>
            </nav>
            <div className="mobile-drawer-prefs">
                <PreferenceControls />
            </div>
        </aside>
        <nav className="mobile-quick-nav" aria-label="Quick navigation">
            <Link href="/projects"><T>{"Portfolio ↗"}</T></Link>
            <Link href="/world"><T>{"The Archive ◎"}</T></Link>
            <Link href="/contact"><T>{"Contact ↗"}</T></Link>
        </nav>
    </>;
}
