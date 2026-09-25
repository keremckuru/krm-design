'use client';
import { useState, useEffect, useRef } from 'react';

export function KRMPhysics() {
    const [active, setActive] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        let seq = '';
        const onK = (e) => {
            seq += e.key.toLowerCase();
            if (seq.length > 20) seq = seq.slice(-20);
            if (seq.endsWith('krm')) {
                setActive(v => !v);
                seq = '';
            }
        };
        window.addEventListener('keydown', onK);
        return () => window.removeEventListener('keydown', onK);
    }, []);

    useEffect(() => {
        if (!active || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Letters K, R, M with physics vectors
        const letters = [
            { char: 'K', x: canvas.width * 0.25, y: -200, vx: 0, vy: 0, r: 0, vr: 0.05, size: 120 },
            { char: 'R', x: canvas.width * 0.50, y: -400, vx: 0, vy: 0, r: 0, vr: -0.04, size: 120 },
            { char: 'M', x: canvas.width * 0.75, y: -600, vx: 0, vy: 0, r: 0, vr: 0.06, size: 120 }
        ];

        const gravity = 0.5;
        const bounce = -0.7;
        const friction = 0.99;

        let mouseX = -1000;
        let mouseY = -1000;
        let prevMouseX = -1000;
        let prevMouseY = -1000;

        const onMove = (e) => {
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            mouseX = e.clientX || e.touches?.[0].clientX || -1000;
            mouseY = e.clientY || e.touches?.[0].clientY || -1000;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove);

        let raf;
        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mouseVx = (mouseX - prevMouseX) || 0;
            const mouseVy = (mouseY - prevMouseY) || 0;

            letters.forEach(l => {
                l.vy += gravity;
                l.vx *= friction;
                l.vy *= friction;

                l.x += l.vx;
                l.y += l.vy;
                l.r += l.vr;

                // Floor collision
                const groundY = canvas.height - l.size / 2;
                if (l.y > groundY) {
                    l.y = groundY;
                    l.vy *= bounce;
                    l.vx *= 0.8; // ground friction
                    l.vr *= 0.8;
                }

                // Ceiling collision
                if (l.y < -800) { l.vy *= bounce; }

                // Wall collisions
                if (l.x - l.size / 2 < 0) { l.x = l.size / 2; l.vx *= bounce; }
                if (l.x + l.size / 2 > canvas.width) { l.x = canvas.width - l.size / 2; l.vx *= bounce; }

                // Hover / Swat Interaction
                const dx = l.x - mouseX;
                const dy = l.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const kick = 0.15;
                    l.vx += mouseVx * kick;
                    l.vy += mouseVy * kick;
                    // If mouse was standing still but we hovered it, push it away gently
                    if (Math.abs(mouseVx) < 2 && Math.abs(mouseVy) < 2) {
                        l.vx += (dx / dist) * 5;
                        l.vy += (dy / dist) * 5;
                    }
                    l.vr += (mouseVx * 0.002);
                }

                // Draw 3D Letter
                ctx.save();
                ctx.translate(l.x, l.y);
                ctx.rotate(l.r);

                // Back shadow Layer (Acid)
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--acid') || '#e8ff00';
                ctx.font = '900 130px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(l.char, -8, 8);

                // Front Letter (Ink)
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#000';
                ctx.fillText(l.char, 0, 0);

                ctx.restore();
            });

            // Decelerate mouse memory so kicking stops if mouse is still
            prevMouseX += (mouseX - prevMouseX) * 0.1;
            prevMouseY += (mouseY - prevMouseY) * 0.1;

            raf = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onMove);
            cancelAnimationFrame(raf);
        };

    }, [active]);

    if (!active) return null;
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 999998, pointerEvents: 'none' }} />;
}
