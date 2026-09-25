'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PreferenceControls, T } from '@/components/preferences';

export default function Login() {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [overrideMode, setOverrideMode] = useState(false);

    useEffect(() => {
        let seq = '';
        const onK = (e) => {
            seq += e.key.toLowerCase();
            if (seq.length > 20) seq = seq.slice(-20);
            if (seq.endsWith('override')) {
                setOverrideMode(v => !v);
                seq = '';
            }
        };
        window.addEventListener('keydown', onK);
        return () => window.removeEventListener('keydown', onK);
    }, []);

    return (
        <main className={`brutalist-login ${overrideMode ? 'override-active' : ''}`}>
            <style>{`
                /* ==========================================
                   BRUTALIST EDITORIAL POSTER LAYOUT
                   ========================================== */
                .brutalist-login {
                    display: grid;
                    grid-template-columns: 1fr 450px 80px;
                    height: 100svh;
                    width: 100vw;
                    background: var(--paper);
                    color: var(--ink);
                    font-family: var(--font, 'Inter', system-ui, sans-serif);
                    overflow: hidden;
                }

                /* Mobile fallback */
                @media (max-width: 900px) {
                    .brutalist-login {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr auto;
                        overflow-y: auto;
                    }
                    .brutalist-border-right {
                        border-right: none !important;
                        border-bottom: 2px solid var(--ink) !important;
                    }
                    .poster-title {
                        font-size: 15vw !important;
                        writing-mode: horizontal-tb !important;
                        transform: none !important;
                        margin: 20px !important;
                    }
                    .utilities-strip {
                        border-left: none !important;
                        border-top: 2px solid var(--ink) !important;
                        flex-direction: row !important;
                        padding: 10px !important;
                    }
                    .utilities-strip .preference-controls {
                        transform: none !important;
                    }
                }

                .brutalist-pane {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .brutalist-border-right {
                    border-right: 2px solid var(--ink);
                }

                /* ----- LEFT HERO (POSTER ZONE) ----- */
                .poster-hero {
                    justify-content: space-between;
                    padding: 40px;
                    overflow: hidden;
                    background: var(--paper);
                    position: relative;
                }

                .poster-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    z-index: 10;
                }

                .poster-brand {
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    text-decoration: none;
                    color: var(--ink);
                    transition: opacity 0.2s;
                }
                
                .poster-brand:hover {
                    opacity: 0.7;
                }

                .poster-title-wrap {
                    position: absolute;
                    bottom: -20px;
                    left: 20px;
                    z-index: 5;
                    pointer-events: none;
                }

                .poster-title {
                    font-size: 14vw;
                    font-weight: 800;
                    line-height: 0.8;
                    letter-spacing: -0.06em;
                    color: var(--ink);
                    margin: 0;
                    text-transform: uppercase;
                }

                .poster-barcode {
                    position: absolute;
                    top: 40px;
                    right: 40px;
                    text-align: right;
                    font-size: 10px;
                    font-family: monospace;
                    line-height: 1.4;
                    color: var(--ink);
                    opacity: 0.6;
                    z-index: 10;
                }

                /* ----- CENTER (FORM ZONE) ----- */
                .form-pane {
                    background: var(--paper);
                    justify-content: center;
                    padding: 40px;
                    z-index: 20;
                }

                .brutalist-heading {
                    margin-bottom: 60px;
                }

                .brutalist-heading h1 {
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                }

                .brutalist-heading p {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    opacity: 0.5;
                    margin: 0;
                }

                .form-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .brutal-input {
                    display: flex;
                    flex-direction: column;
                }

                .brutal-input label {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 8px;
                    color: var(--ink);
                }

                .brutal-input input {
                    background: transparent;
                    border: 2px solid var(--ink);
                    padding: 16px;
                    font-size: 16px;
                    color: var(--ink);
                    border-radius: 0;
                    outline: none;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .brutal-input input:focus {
                    background: var(--ink);
                    color: var(--paper);
                }
                
                .brutal-input input:focus::placeholder {
                    color: var(--paper);
                    opacity: 0.4;
                }

                .brutal-input input::placeholder {
                    color: var(--ink);
                    opacity: 0.2;
                }

                .brutal-btn-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 10px;
                }

                .brutal-btn {
                    background: var(--ink);
                    color: var(--paper);
                    border: 2px solid var(--ink);
                    padding: 20px;
                    font-size: 14px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .brutal-btn:hover:not(:disabled) {
                    background: var(--acid);
                    color: #000;
                    border-color: var(--ink);
                }

                .brutal-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                /* Tiny yellow detail line above button */
                .brutal-detail-line {
                    height: 4px;
                    width: 40px;
                    background: var(--acid);
                }

                .brutal-error {
                    background: var(--ink);
                    color: var(--paper);
                    padding: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin: 0;
                    border: 2px solid var(--ink);
                }

                /* ----- RIGHT (UTILITY STRIP) ----- */
                .utilities-strip {
                    border-left: 2px solid var(--ink);
                    background: var(--paper);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px 0;
                }

                .utilities-strip .preference-controls {
                    transform: rotate(90deg);
                    transform-origin: center;
                    display: flex;
                    gap: 20px;
                    white-space: nowrap;
                }
                
                /* ==========================================
                   OVERRIDE EASTER EGG (RED ALARM)
                   ========================================== */
                .override-active .poster-hero {
                    background: #aa0000 !important;
                    animation: sirenFlash 1s infinite alternate;
                }
                .override-active .poster-title {
                    color: var(--ink) !important;
                    animation: glitchText 0.2s infinite;
                }
                .override-active .poster-barcode {
                    color: var(--ink) !important;
                    font-weight: 800;
                    font-size: 14px;
                    opacity: 1 !important;
                    animation: glitchText 0.4s infinite;
                }
                .override-active .logo-dark, .override-active .logo-light {
                    filter: drop-shadow(0 0 10px red);
                }
                
                @keyframes sirenFlash {
                    0% { background: #330000 !important; }
                    100% { background: #ff0000 !important; }
                }
                @keyframes glitchText {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(-3px, 2px); }
                    50% { transform: translate(3px, -2px); }
                    75% { transform: translate(-3px, -2px); }
                    100% { transform: translate(3px, 2px); }
                }
            `}</style>

            {/* PANE 1: THE STRICT BRUTALIST POSTER (NO YELLOW) */}
            <section className="brutalist-pane brutalist-border-right poster-hero">
                <div className="poster-header">
                    <a href="/" className="poster-brand">
                        <Image src="/krmIconDarkMode.png" alt="KRM Design" width={40} height={40} className="logo-dark" />
                        <Image src="/krmIconLightMode.png" alt="KRM Design" width={40} height={40} className="logo-light" />
                    </a>
                </div>

                <div className="poster-barcode">
                    {overrideMode ? (
                        <>ALERT.CRITICAL.FAILURE<br />[! SYSTEM COMPROMISED !]<br />INITIATING LOCKDOWN...<br />ERR_1337_OVERRIDE</>
                    ) : (
                        <>SYSTEM.AUTH.2026<br />ID: 8092-A<br />IP: SECURE<br />[ AUTHORIZED PERSONNEL ONLY ]</>
                    )}
                </div>

                <div className="poster-title-wrap">
                    <h1 className="poster-title">
                        {overrideMode ? <>SYSTEM<br />BREACH</> : <>STUDIO<br />CTRL</>}
                    </h1>
                </div>
            </section>

            {/* PANE 2: THE FORM */}
            <section className="brutalist-pane form-pane">
                <div className="brutalist-heading">
                    <h1><T>Authentication</T></h1>
                    <p><T>Verify credentials to grant administrative access.</T></p>
                </div>

                <form className="form-layout" onSubmit={async event => {
                    event.preventDefault();
                    setBusy(true);
                    setError('');
                    const form = new FormData(event.currentTarget);
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(Object.fromEntries(form))
                        });
                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error);
                        location.assign('/admin');
                    } catch (error) {
                        setError(error.message);
                        setBusy(false);
                    }
                }}>
                    <div className="brutal-input">
                        <label><T>Identity</T></label>
                        <input name="email" type="email" autoComplete="username" required maxLength={200} placeholder="kerem@..." />
                    </div>

                    <div className="brutal-input">
                        <label><T>Passcode</T></label>
                        <input name="password" type="password" autoComplete="current-password" required maxLength={256} placeholder="••••••••" />
                    </div>

                    {error && <p className="brutal-error" role="alert">{error}</p>}

                    <div className="brutal-btn-wrap">
                        <div className="brutal-detail-line"></div>
                        <button className="brutal-btn" disabled={busy}>
                            <T>{busy ? 'Verifying...' : 'Sign in'}</T>
                        </button>
                    </div>
                </form>
            </section>

            {/* PANE 3: UTILITIES */}
            <aside className="brutalist-pane utilities-strip">
                <PreferenceControls />
            </aside>
        </main>
    );
}
