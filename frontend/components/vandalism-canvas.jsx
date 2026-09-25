'use client';
import { useState, useEffect, useRef } from 'react';

export function VandalismCanvas() {
    const [paintMode, setPaintMode] = useState(false);
    const canvasRef = useRef(null);
    const painting = useRef(false);

    useEffect(() => {
        let seq = '';
        const onK = (e) => {
            seq += e.key.toLowerCase();
            if (seq.length > 20) seq = seq.slice(-20);
            if (seq.endsWith('paint')) {
                setPaintMode(v => !v);
                seq = '';
            }
        };
        window.addEventListener('keydown', onK);
        return () => window.removeEventListener('keydown', onK);
    }, []);

    useEffect(() => {
        if (!paintMode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        };

        window.addEventListener('resize', resize);
        resize();

        let hue = 320; // Neon pink start

        const draw = (x, y, dx, dy) => {
            // Shadow for glowing neon spray
            ctx.shadowBlur = 25;
            ctx.shadowColor = `hsl(${hue}, 100%, 55%)`;

            // Outer thick spray
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
            ctx.lineWidth = 15 + Math.random() * 10;
            ctx.beginPath();
            ctx.moveTo(dx, dy);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Inner sharp core
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.stroke();

            /* Splatter effect */
            for (let i = 0; i < 3; i++) {
                const rx = x + (Math.random() - 0.5) * 40;
                const ry = y + (Math.random() - 0.5) * 40;
                ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
                ctx.beginPath();
                ctx.arc(rx, ry, Math.random() * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            hue += 0.8;
        };

        const lastPos = { current: null };

        const onDown = (e) => {
            painting.current = true;
            if (e.touches && document.body) document.body.style.overflow = 'hidden'; // prevent scroll when spraying touch
            lastPos.current = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
        };

        const onUp = () => {
            painting.current = false;
            if (document.body) document.body.style.overflow = '';
        };

        const onMove = (e) => {
            if (!painting.current || !lastPos.current) return;
            const x = e.clientX || e.touches?.[0].clientX;
            const y = e.clientY || e.touches?.[0].clientY;

            draw(x, y, lastPos.current.x, lastPos.current.y);
            lastPos.current = { x, y };

            if (e.touches) e.preventDefault();
        };

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp);
        };
    }, [paintMode]);

    if (!paintMode) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, cursor: 'crosshair', touchAction: 'none' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#000', color: '#0f0', border: '1px solid #0f0', padding: '6px 12px', fontSize: '10px', textTransform: 'uppercase', pointerEvents: 'none', fontWeight: 'bold', letterSpacing: '2px', boxShadow: '0 0 10px rgba(0,255,0,0.5)', zIndex: 2 }}>
                VANDALISM MODE ACTIVE
            </div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', background: 'transparent' }} />
        </div>
    );
}
