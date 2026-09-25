'use client';
import { T, usePreferences } from '@/components/preferences';
import { useEffect, useRef, useState, useMemo } from 'react';
import Link from '@/components/site-link';
import { countryIso } from '@/lib/country-data';

const names = { 'Turkey': 'Türkiye' };
const geography = country => ['England', 'Scotland', 'Wales', 'Northern Ireland'].includes(country) ? 'United Kingdom' : country;

export function WorldIndex({ projects }) {
    const { t } = usePreferences();
    const [themeColors, setThemeColors] = useState({ paper: '#111311', ink: '#fdfce1', acid: '#e8ff00', line: 'rgba(255,255,255,0.1)', isLight: false });

    useEffect(() => {
        const checkTheme = () => {
            const isLightState = document.documentElement.getAttribute('data-theme') === 'light';
            const computed = getComputedStyle(document.documentElement);
            const varValue = (name) => {
                const val = document.documentElement.style.getPropertyValue(name) || computed.getPropertyValue(name);
                return val ? val.trim() : '';
            };
            setThemeColors({
                isLight: isLightState,
                paper: varValue('--paper') || (isLightState ? '#f2f0ea' : '#111311'),
                ink: varValue('--ink') || (isLightState ? '#0c0f0d' : '#fdfce1'),
                acid: varValue('--acid') || '#e8ff00',
                line: varValue('--line') || (isLightState ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)')
            });
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
        return () => observer.disconnect();
    }, []);

    const canvas = useRef(null);
    const [features, setFeatures] = useState([]);
    const [angle, setAngle] = useState(20);
    const [zoom, setZoom] = useState(1);
    const [latitude, setLatitude] = useState(20);
    const [selected, setSelected] = useState(projects[0]?.country || 'Türkiye');
    const [hover, setHover] = useState('');
    const [failed, setFailed] = useState(false);
    const [mode, setMode] = useState('globe');
    const [search, setSearch] = useState('');
    const [spaceMode, setSpaceMode] = useState(false);

    useEffect(() => {
        let seq = '';
        const onK = (e) => {
            seq += e.key.toLowerCase();
            if (seq.length > 20) seq = seq.slice(-20);
            if (seq.endsWith('space')) {
                setSpaceMode(v => !v);
                seq = ''; // Reset
            }
        };
        window.addEventListener('keydown', onK);
        return () => window.removeEventListener('keydown', onK);
    }, []);

    const drag = useRef(null);
    const touchState = useRef({ dist: null, initZoom: 1 });
    const paths = useRef([]);
    const geometry = useRef({});
    const isHovering = useRef(false);

    // Physics / Auto-rotate engine
    const physics = useRef({ vA: 0.1, vT: 0 }); // auto-rotate 0.1 deg/frame
    const stateRef = useRef({ angle: 20, latitude: 20 });

    useEffect(() => {
        stateRef.current.angle = angle;
        stateRef.current.latitude = latitude;
    }, [angle, latitude]);

    useEffect(() => {
        let frameId;
        const tick = () => {
            if (!drag.current) {
                // Apply physics when not dragging
                const { vA, vT } = physics.current;

                // Keep spinning or auto-rotating
                let nextAngle = stateRef.current.angle - vA;
                let nextLat = stateRef.current.latitude + vT;

                // boundaries for lat
                if (nextLat > 65) { nextLat = 65; physics.current.vT *= -0.5; }
                if (nextLat < -65) { nextLat = -65; physics.current.vT *= -0.5; }

                // If hovered, slow down to 0, else target 0.1
                const targetVA = isHovering.current ? 0 : 0.1;

                if (vA > targetVA) physics.current.vA *= 0.96;
                else if (vA < targetVA) physics.current.vA = vA + (targetVA - vA) * 0.05; // slowly return to targetVA

                physics.current.vT *= 0.95; // decay latitude velocity

                if (Math.abs(nextAngle - stateRef.current.angle) > 0.01 || Math.abs(nextLat - stateRef.current.latitude) > 0.01) {
                    setAngle(nextAngle);
                    setLatitude(nextLat);
                }
            }
            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, []);

    const countries = useMemo(() => [...new Set(projects.map(p => p.country))], [projects]);
    useEffect(() => {
        fetch('/countries.json').then(r => {
            if (!r.ok) throw new Error('Map unavailable'); return r.json();
        }).then((d) => setFeatures(d.features)).catch(() => setFailed(true));
    }, []);

    useEffect(() => {
        const c = canvas.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const size = 800, r = 330 * zoom;
        ctx.clearRect(0, 0, size, size);

        const hexToRgba = (hex, alpha) => {
            if (!hex.startsWith('#')) return hex;
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
            else if (hex.length >= 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const gr = ctx.createRadialGradient(400, 400, 0, 400, 400, r);
        gr.addColorStop(0, hexToRgba(themeColors.ink, 0.12));
        gr.addColorStop(1, hexToRgba(themeColors.ink, 0.02));
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(400, 400, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = hexToRgba(themeColors.ink, 0.15);
        ctx.stroke();
        const rebuild = geometry.current.angle !== angle || geometry.current.latitude !== latitude || geometry.current.zoom !== zoom || geometry.current.features !== features;

        if (rebuild) {
            paths.current = [];
            const project = ([lon, lat]) => {
                const a = (lon - angle) * Math.PI / 180, b = lat * Math.PI / 180, tilt = latitude * Math.PI / 180;
                const x = Math.cos(b) * Math.sin(a), y = Math.sin(b) * Math.cos(tilt) - Math.cos(b) * Math.cos(a) * Math.sin(tilt), z = Math.sin(b) * Math.sin(tilt) + Math.cos(b) * Math.cos(a) * Math.cos(tilt);
                return [400 + r * x, 400 - r * y, z];
            };
            for (const f of features) {
                const name = names[f.properties.name] || f.properties.name;
                const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
                const path = new Path2D();
                for (const poly of polys) {
                    for (const ring of poly) {
                        let pen = false;
                        for (const point of ring) {
                            const [x, y, z] = project(point);
                            if (z < 0) { pen = false; continue; }
                            if (!pen) { path.moveTo(x, y); pen = true; }
                            else path.lineTo(x, y);
                        }
                    }
                }
                paths.current.push({ path, name });
            }
            geometry.current = { angle, latitude, zoom, features };
        }
        for (const { path, name } of paths.current) {
            const fillEmpty = hexToRgba(themeColors.ink, 0.15);
            const fillHasProj = hexToRgba(themeColors.ink, 0.50);
            const fillHov = hexToRgba(themeColors.ink, 0.90);

            ctx.fillStyle = name === geography(selected) ? themeColors.acid : name === hover ? fillHov : countries.some(country => geography(country) === name) ? fillHasProj : fillEmpty;
            ctx.strokeStyle = hexToRgba(themeColors.paper, 0.6);
            ctx.lineWidth = 0.5;
            ctx.fill(path);
            ctx.stroke(path);
        }
    }, [angle, latitude, zoom, features, selected, hover, countries, mode, themeColors]);

    function hit(e) {
        const c = canvas.current; const b = c.getBoundingClientRect(), ctx = c.getContext('2d');
        return [...paths.current].reverse().find(p => ctx.isPointInPath(p.path, (e.clientX - b.left) * 800 / b.width, (e.clientY - b.top) * 800 / b.height))?.name || '';
    }

    function choose(country) {
        setSelected(country);
        const feature = features.find(f => (names[f.properties.name] || f.properties.name) === geography(country));
        if (!feature) return;
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        const ring = [...polygons].sort((a, b) => b[0].length - a[0].length)[0]?.[0]; if (!ring?.length) return;

        const longitude = Math.atan2(ring.reduce((sum, p) => sum + Math.sin(p[0] * Math.PI / 180), 0), ring.reduce((sum, p) => sum + Math.cos(p[0] * Math.PI / 180), 0)) * 180 / Math.PI;
        setAngle(longitude); setLatitude(Math.max(-65, Math.min(65, ring.reduce((sum, p) => sum + p[1], 0) / ring.length)));
        physics.current = { vA: 0.1, vT: 0 };
    }

    return (
        <div className={`world-layout ${mode === 'list' ? 'list-only' : ''} ${spaceMode ? 'space-mode' : ''}`}>
            {spaceMode && <style>{`
                .space-mode { background: #000 !important; color: #fff !important; }
                .space-mode .page-heading h1, .space-mode .page-heading p { color: #fff !important; text-shadow: 0 0 15px rgba(255,255,255,0.3); }
                .space-environment { position: absolute; inset: 0; pointer-events: none; z-index: -1; overflow: hidden; }
                .stars-layer { position: absolute; left: 0; top: 0; background: transparent; }
                
                /* Large random constellation shadow generation */
                .stars-1 { width: 1px; height: 1px; box-shadow: 10vw 10vh #fff, 20vw 80vh #fff, 30vw 30vh #fff, 40vw 90vh #fff, 50vw 10vh #fff, 60vw 60vh #fff, 70vw 20vh #fff, 80vw 80vh #fff, 90vw 40vh #fff, 15vw 50vh #fff, 85vw 15vh #fff, 45vw 45vh #fff; animation: floatSpace 150s linear infinite; }
                .stars-2 { width: 2px; height: 2px; box-shadow: 5vw 40vh #fff, 25vw 20vh #fff, 35vw 70vh #fff, 55vw 50vh #fff, 65vw 90vh #fff, 75vw 10vh #fff, 95vw 60vh #fff; animation: floatSpace 80s linear infinite reverse; }
                
                @keyframes floatSpace { from { transform: translateY(0vh); } to { transform: translateY(-100vh); } }
                
                .ufo-ship { position: absolute; font-size: 28px; animation: ufoOrbit 18s ease-in-out infinite; filter: drop-shadow(0 5px 15px #0f0); z-index: 10; }
                @keyframes ufoOrbit { 
                    0% { transform: translate(-50vw, 50vh) scale(0.5) rotate(-20deg); opacity: 0; } 
                    30% { transform: translate(30vw, 20vh) scale(1.2) rotate(10deg); opacity: 1; }
                    50% { transform: translate(45vw, 40vh) scale(1.5) rotate(0deg); opacity: 1; }
                    70% { transform: translate(60vw, 15vh) scale(1) rotate(-10deg); opacity: 1; }
                    100% { transform: translate(120vw, 70vh) scale(0.2) rotate(40deg); opacity: 0; } 
                }
            `}</style>}

            {spaceMode && mode === 'globe' && (
                <div className="space-environment">
                    <div className="stars-layer stars-1"></div>
                    <div className="stars-layer stars-2"></div>
                    <div className="stars-layer stars-1" style={{ top: '100vh' }}></div>
                    <div className="ufo-ship">🛸</div>
                </div>
            )}

            {mode === 'globe' && (
                <div className="globe-wrap" onMouseEnter={() => isHovering.current = true} onMouseLeave={() => isHovering.current = false} style={{ background: spaceMode ? 'transparent' : '' }}>
                    <div className="eyebrow globe-caption" style={{ color: 'var(--ink)' }}>
                        <T>{"Drag to rotate / Select a country"}</T>
                    </div>
                    {!features.length && !failed && (
                        <p className="globe-status" role="status"><T>{"Loading world map…"}</T></p>
                    )}
                    {failed ? (
                        <p><T>{"Map unavailable. Choose a country from the index."}</T></p>
                    ) : (
                        <canvas
                            ref={canvas}
                            width={800} height={800}
                            aria-label={t("Rotatable world map. Use country buttons for keyboard navigation.")}
                            onPointerDown={e => {
                                if (e.pointerType === 'touch') return; // We handle touch manually
                                drag.current = { x: e.clientX, y: e.clientY, moved: false, lastTimes: [Date.now()] };
                                e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onPointerMove={e => {
                                if (e.pointerType === 'touch') return;
                                if (drag.current) {
                                    const dx = (e.clientX - drag.current.x) * 0.4 / zoom;
                                    const dy = (e.clientY - drag.current.y) * 0.3 / zoom;
                                    if (Math.hypot(dx, dy) > 1) {
                                        drag.current.moved = true;
                                    }
                                    drag.current.x = e.clientX;
                                    drag.current.y = e.clientY;
                                    physics.current.vA = dx;
                                    physics.current.vT = dy;
                                    setAngle(a => a - dx);
                                    setLatitude(lat => Math.max(-65, Math.min(65, lat + dy)));
                                } else {
                                    setHover(hit(e));
                                }
                            }}
                            onPointerUp={e => {
                                if (e.pointerType === 'touch') return;
                                if (drag.current && !drag.current.moved) {
                                    const n = hit(e);
                                    const country = countries.find(country => geography(country) === n);
                                    if (country) choose(country);
                                }
                                drag.current = null;
                            }}
                            onLostPointerCapture={(e) => { if (e.pointerType !== 'touch') drag.current = null; }}
                            onPointerCancel={(e) => { if (e.pointerType !== 'touch') drag.current = null; }}
                            onWheel={e => {
                                e.preventDefault();
                                setZoom(z => Math.max(1, Math.min(2.5, z - (e.deltaY * 0.002))));
                            }}
                            onTouchStart={e => {
                                if (e.touches.length === 2) {
                                    const dx = e.touches[1].clientX - e.touches[0].clientX;
                                    const dy = e.touches[1].clientY - e.touches[0].clientY;
                                    touchState.current.dist = Math.hypot(dx, dy);
                                    touchState.current.initZoom = zoom;
                                } else if (e.touches.length === 1) {
                                    drag.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, moved: false };
                                }
                            }}
                            onTouchMove={e => {
                                if (e.touches.length === 2 && touchState.current.dist) {
                                    e.preventDefault();
                                    const dx = e.touches[1].clientX - e.touches[0].clientX;
                                    const dy = e.touches[1].clientY - e.touches[0].clientY;
                                    const dist = Math.hypot(dx, dy);
                                    const next = touchState.current.initZoom * (dist / touchState.current.dist);
                                    setZoom(Math.max(1, Math.min(2.5, next)));
                                } else if (e.touches.length === 1 && drag.current) {
                                    e.preventDefault(); // Prevents sticky scroll
                                    const dx = (e.touches[0].clientX - drag.current.x) * 0.4 / zoom;
                                    const dy = (e.touches[0].clientY - drag.current.y) * 0.3 / zoom;
                                    if (Math.hypot(dx, dy) > 1) drag.current.moved = true;
                                    drag.current.x = e.touches[0].clientX;
                                    drag.current.y = e.touches[0].clientY;
                                    physics.current.vA = dx;
                                    physics.current.vT = dy;
                                    setAngle(a => a - dx);
                                    setLatitude(lat => Math.max(-65, Math.min(65, lat + dy)));
                                }
                            }}
                            onTouchEnd={e => {
                                if (e.touches.length < 2) touchState.current.dist = null;
                                if (e.touches.length === 0 && drag.current) {
                                    if (!drag.current.moved) {
                                        // Mobile tapping natively sends a mouse event, but we handle it manually logic if needed.
                                        // Wait, hit() calculates based on canvas boundaries. For touch, we need bcr math.
                                        const c = canvas.current; const b = c.getBoundingClientRect(), ctx = c.getContext('2d');
                                        const touchHit = [...paths.current].reverse().find(p => ctx.isPointInPath(p.path, (drag.current.x - b.left) * 800 / b.width, (drag.current.y - b.top) * 800 / b.height))?.name || '';
                                        const country = countries.find(c => geography(c) === touchHit);
                                        if (country) choose(country);
                                    }
                                    drag.current = null;
                                }
                            }}
                            style={{ touchAction: 'none' }}
                        />
                    )}
                    <p className="eyebrow" style={{ color: 'var(--ink)', textAlign: 'center' }}>{hover ? t(hover) : 'KRM DESIGN / THE ARCHIVE'}</p>
                    <div className="globe-arrows">
                        <button aria-label={t("Zoom out")} disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - .25))}>−</button>
                        <output>{Math.round(zoom * 100)}%</output>
                        <button aria-label={t("Zoom in")} disabled={zoom >= 2.5} onClick={() => setZoom(Math.min(2.5, zoom + .25))}>+</button>
                        <button className="reset-globe" onClick={() => { choose(selected); physics.current = { vA: 0.1, vT: 0 }; setZoom(1); }}><T>{"Reset view"}</T></button>
                    </div>
                </div>
            )}
            <aside className="country-panel">
                <div className="explorer-toolbar">
                    <p className="eyebrow"><T>{"Country index /"}</T> {countries.length}</p>
                    <button onClick={() => setMode(mode === 'globe' ? 'list' : 'globe')}>{t(mode === 'globe' ? 'List view' : 'Globe view')}</button>
                </div>
                <input className="country-search" aria-label={t("Find a country")} placeholder={t("Find a country…")} value={search} onChange={e => setSearch(e.target.value)} />
                <div className="country-buttons">
                    {countries.filter(c => (c + ' ' + t(c)).toLowerCase().includes(search.toLowerCase())).map(c => <button key={c} aria-pressed={selected === c} onClick={() => choose(c)}>{t(c)}</button>)}
                </div>
                <h2>{t(selected)} {countryIso[selected] && <img src={`https://flagcdn.com/h40/${countryIso[selected]}.png`} alt={`${selected} flag`} style={{ height: '28px', width: 'auto', verticalAlign: 'baseline', marginLeft: '12px', borderRadius: '4px' }} />}</h2>
                <p className="country-summary">{projects.filter(p => p.country === selected).length} <T>{"published projects"}</T></p>
                {['National', 'Club'].map(k => (
                    <section key={k}>
                        <p className="eyebrow">{t(k === 'National' ? 'National team' : 'Club teams')}</p>
                        {[...new Set(projects.filter(p => p.country === selected && p.kind === k).map(p => p.team))].map(t => (
                            <Link className="team-preview" key={t} href={'/projects?team=' + encodeURIComponent(t)}>
                                <img alt="" loading="lazy" src={projects.find(p => p.team === t)?.images[0]} />
                                <strong>{t}</strong><span>{projects.filter(p => p.team === t).length} ↗</span>
                            </Link>
                        ))}
                        {!projects.some(p => p.country === selected && p.kind === k) && <p className="muted"><T>{"No published projects yet."}</T></p>}
                    </section>
                ))}
            </aside>
        </div>
    );
}
