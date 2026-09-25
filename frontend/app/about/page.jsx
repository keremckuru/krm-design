'use client';
import { useState, useEffect, useRef } from 'react';
import { T } from '@/components/preferences';
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  const [matrixActive, setMatrixActive] = useState(false);
  const canvasRef = useRef(null);

  // Sequence Listener
  useEffect(() => {
    let sequence = '';
    const onKey = (e) => {
      sequence += e.key.toLowerCase();
      if (sequence.length > 20) sequence = sequence.slice(-20);
      if (sequence.endsWith('matrix')) {
        setMatrixActive(v => !v);
        sequence = ''; // Reset sequence so it doesn't immediately toggle again
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Matrix Rain Canvas Logic
  useEffect(() => {
    if (!matrixActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const chars = 'AБBГДEЁЖЗИЙKЛMHОПРCTУФXЦЧШЩЪЫЬЭЮЯ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
    const fontSize = 16;
    let drops = [];

    const initDrops = () => {
      const columns = canvas.width / fontSize;
      drops = [];
      for (let x = 0; x < columns; x++) drops[x] = 1;
    };
    initDrops();
    window.addEventListener('resize', initDrops);

    const draw = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isLight ? '#0a0' : '#0f0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', initDrops);
    };
  }, [matrixActive]);

  return (<main className={`min-h-screen relative flex flex-col ${matrixActive ? 'matrix-mode' : ''}`}>
    <style>{`
        .matrix-mode {
            --paper: #000 !important;
            --ink: #0f0 !important;
            --acid: #0f0 !important;
            --line: rgba(0,255,0,0.2) !important;
            background-color: var(--paper) !important;
            color: var(--ink) !important;
            text-shadow: 0 0 8px rgba(0,255,0,0.4);
        }
        [data-theme="light"] .matrix-mode {
            --paper: #fff !important;
            --ink: #0a0 !important;
            --acid: #0a0 !important;
            --line: rgba(0,200,0,0.2) !important;
            text-shadow: none;
        }
        .matrix-mode .logo-light, .matrix-mode .logo-dark {
            filter: invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%) !important;
            opacity: 1 !important;
            display: block !important;
        }
        .matrix-mode .logo-dark {
            display: block !important;
        }
        .matrix-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
            opacity: 0.6;
        }
        .matrix-close {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            background: var(--paper);
            color: var(--ink);
            border: 1px solid var(--ink);
            padding: 8px 16px;
            font-family: monospace;
            cursor: pointer;
            text-transform: uppercase;
        }
        .matrix-close:hover {
            background: var(--ink);
            color: var(--paper);
        }
        
        /* ULTRA MODERN CSS */
        .ultra-hero {
            padding: 120px 3vw 80px;
            display: flex;
            flex-direction: column;
            animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        .ultra-hero h1 {
            font-size: clamp(55px, 9vw, 150px);
            font-weight: 900;
            line-height: 0.88;
            letter-spacing: -0.06em;
            text-transform: uppercase;
            margin: 0;
            white-space: nowrap;
        }
        .ultra-hero h1 em {
            display: block;
            font-family: Georgia, serif;
            font-style: italic;
            font-weight: 400;
            text-transform: none;
            letter-spacing: -0.02em;
            color: var(--ink);
            margin-left: max(5vw, 50px);
        }
        
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 20px;
            padding: 0 3vw 120px;
            opacity: 0;
            transform: translateY(30px);
            animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .bento-card {
            background: color-mix(in srgb, var(--line) 20%, transparent);
            border: 1px solid color-mix(in srgb, var(--line) 40%, transparent);
            border-radius: 20px;
            padding: 45px;
            display: flex;
            flex-direction: column;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, background-color 0.4s;
            overflow: hidden;
            position: relative;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            min-height: 380px;
        }
        .bento-card:hover {
            transform: translateY(-8px);
            border-color: color-mix(in srgb, var(--ink) 40%, transparent);
            background: color-mix(in srgb, var(--line) 30%, transparent);
        }
        .bento-card.primary {
            justify-content: center;
            background: var(--ink);
            color: var(--paper);
            border-color: transparent;
        }
        .bento-card.primary:hover {
            transform: translateY(-8px);
            background: var(--ink);
        }
        
        .span-4 { grid-column: span 4; }
        .span-8 { grid-column: span 8; }
        .span-6 { grid-column: span 6; }
        .span-12 { grid-column: span 12; }
        
        @media (max-width: 960px) {
            .span-4, .span-6, .span-8 { grid-column: span 12; }
            .bento-card { padding: 30px; min-height: auto; }
            .ultra-hero h1 { white-space: normal; }
        }

        .stat-value {
            font-size: clamp(60px, 8vw, 130px);
            font-weight: 900;
            line-height: 0.9;
            letter-spacing: -0.05em;
            margin-bottom: auto;
        }
        .stat-label {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: inherit;
            opacity: 0.8;
            margin-top: 40px;
        }
        .p-lead {
            font-size: clamp(24px, 3.5vw, 42px);
            line-height: 1.15;
            font-weight: 500;
            letter-spacing: -0.02em;
            max-width: 95%;
        }
        .p-body {
            font-size: clamp(16px, 1.5vw, 18px);
            line-height: 1.5;
            margin-top: 40px;
            color: inherit;
            opacity: 0.75;
            max-width: 90%;
        }
        
        /* Marquee */
        .dynamic-marquee {
            overflow: hidden;
            white-space: nowrap;
            display: flex;
            padding: 30px 0;
            margin-bottom: 80px;
            background: color-mix(in srgb, var(--line) 20%, transparent);
            border-top: 1px solid var(--line);
            border-bottom: 1px solid var(--line);
            opacity: 0;
            animation: fadeUp 1s 0.1s forwards;
        }
        .dynamic-marquee div {
            display: flex;
            animation: about-marquee 30s linear infinite;
        }
        .dynamic-marquee span {
            font-size: 80px;
            font-weight: 900;
            text-transform: uppercase;
            padding: 0 40px;
            letter-spacing: -0.04em;
            color: transparent;
            -webkit-text-stroke: 1px var(--ink);
        }
        @keyframes about-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Matrix visual fixes */
        .matrix-mode .bento-card {
            background: rgba(0,255,0,0.02) !important;
            border-color: rgba(0,255,0,0.3) !important;
            box-shadow: inset 0 0 20px rgba(0,255,0,0.05);
        }
        .matrix-mode .bento-card.primary {
            background: rgba(0,255,0,0.1) !important;
            border: 1px solid #0f0 !important;
        }
    `}</style>

    {matrixActive && <canvas ref={canvasRef} className="matrix-canvas"></canvas>}
    {matrixActive && <button className="matrix-close" onClick={() => setMatrixActive(false)}>Close Matrix</button>}

    <SiteHeader />

    <div className="flex-1" style={{ position: 'relative', zIndex: 10 }}>
      {/* EDITORIAL HERO */}
      <section className="ultra-hero">
        <p className="eyebrow mb-6"><T>{"Studio / About"}</T></p>
        <h1>
          <T>{"Not just"}</T><br />
          <T>{"a shirt."}</T>
          <em><T>{"A whole world."}</T></em>
        </h1>
      </section>

      {/* DYNAMIC MARQUEE */}
      <div className="dynamic-marquee">
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex">
              <span><T>{"FOOTBALL"}</T></span><span>×</span>
              <span><T>{"CULTURE"}</T></span><span>×</span>
              <span>KRM DESIGN</span><span>×</span>
            </div>
          ))}
        </div>
      </div>

      {/* BENTO GRID */}
      <section className="bento-grid">

        {/* Main Lead Block */}
        <div className="bento-card primary span-8">
          <p className="p-lead">
            <T>{"KRM Design is the independent practice of Kerem Can Kuru, focused on the space where football, fashion and visual culture meet."}</T>
          </p>
          <div className="flex flex-col h-full justify-end mt-10">
            <p className="p-body" style={{ marginTop: 0 }}>
              <T>{"Every project begins with a specific cultural idea — not a trend board. That idea becomes a kit, then expands into typography, objects, casting, sets and campaign imagery. Based in Edirne and working internationally."}</T>
            </p>
            <div className="mt-8 flex items-center gap-3 opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="15000 -20000 45000 40000" className="h-[1.125rem] w-auto fill-current">
                <path d="m41750 0 13568-4408-8386 11541V-7133l8386 11541zm925 8021a15000 15000 0 1 1 0-16042 12000 12000 0 1 0 0 16042z" />
              </svg>
              <span className="text-xs font-bold tracking-[0.15em] uppercase"><T>{"Edirne, Türkiye"}</T></span>
            </div>
          </div>
        </div>

        {/* Small Metric 1 */}
        <div className="bento-card span-4">
          <div className="stat-value">04+</div>
          <div className="stat-label"><T>{"Years of independent practice"}</T></div>
        </div>

        {/* Expanded Metric 2 */}
        <div className="bento-card span-6">
          <div className="stat-value">07</div>
          <p className="p-body">
            <T>{"Designs taken into production for Adana Demirspor, FK Skopje 1911, Vaultify and Foxglove."}</T>
          </p>
          <div className="stat-label"><T>{"Projects deployed"}</T></div>
        </div>

        {/* Expanded Metric 3 */}
        <div className="bento-card span-6">
          <div className="stat-value">∞</div>
          <p className="p-body">
            <T>{"Exploring intersections of team heritage, modern apparel lines, and visual identity."}</T>
          </p>
          <div className="stat-label"><T>{"Football cultures to explore"}</T></div>
        </div>

      </section>
    </div>

    <SiteFooter />
  </main>);
}
