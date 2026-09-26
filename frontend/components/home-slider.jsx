'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePreferences, T } from './preferences';

export function HomeSlider({ projects }) {
    const { t } = usePreferences();
    const [index, setIndex] = useState(0);

    const nextSlide = () => setIndex((i) => (i + 1) % projects.length);
    const prevSlide = () => setIndex((i) => (i - 1 + projects.length) % projects.length);

    useEffect(() => {
        if (projects.length <= 1) return;
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % projects.length);
        }, 2000);
        return () => clearInterval(timer);
    }, [projects.length]);

    if (projects.length === 0) return null;

    return (
        <div
            style={{
                position: 'relative', width: '100%', height: '80vh', minHeight: '500px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                perspective: '1000px', marginTop: '30px', marginBottom: '60px', overflow: 'hidden'
            }}
        >
            <AnimatePresence initial={false} custom={index}>
                {projects.map((p, i) => {
                    const len = projects.length;
                    let realDiff = (i - index) % len;
                    if (realDiff > Math.floor(len / 2)) realDiff -= len;
                    if (realDiff < -Math.floor(len / 2)) realDiff += len;

                    if (Math.abs(realDiff) > 2) return null;

                    const abs = Math.abs(realDiff);
                    const isCenter = abs === 0;

                    const scale = abs === 0 ? 1 : (abs === 1 ? 0.9 : 0.8);
                    const x = abs === 0 ? '0%' : (abs === 1 ? (realDiff > 0 ? '65%' : '-65%') : (realDiff > 0 ? '120%' : '-120%'));
                    const zIndex = 10 - abs;
                    const filter = abs === 0 ? 'brightness(1)' : (abs === 1 ? 'brightness(0.6)' : 'brightness(0.3)');

                    return (
                        <motion.div
                            key={p.slug}
                            custom={realDiff}
                            layout
                            initial={{ opacity: 0, x: Math.sign(realDiff) * 150 + '%', scale: 0.5 }}
                            animate={{
                                opacity: abs > 2 ? 0 : 1,
                                x: x,
                                scale: scale,
                                zIndex: zIndex,
                                filter: filter
                            }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            style={{
                                position: 'absolute',
                                width: 'clamp(280px, 40vw, 650px)',
                                aspectRatio: '4/5',
                                borderRadius: '16px', overflow: 'hidden', cursor: isCenter ? 'pointer' : 'default',
                                boxShadow: isCenter ? '0 40px 80px rgba(0,0,0,0.25)' : '0 15px 30px rgba(0,0,0,0.1)',
                                pointerEvents: isCenter ? 'auto' : 'none',
                                backgroundColor: 'transparent'
                            }}
                        >
                            <Link href={'/projects/' + p.slug} style={{ display: 'block', width: '100%', height: '100%' }}>
                                <Image src={p.images[0]} fill style={{ objectFit: 'cover', background: 'transparent' }} alt={p.title} priority={false} sizes="(max-width: 768px) 100vw, 50vw" />
                            </Link>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Title overlay at bottom */}
            <div style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', zIndex: 20 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="eyebrow" style={{ marginBottom: '8px' }}>{projects[index].year} / {projects[index].country}</p>
                        <h3 style={{ fontSize: '32px', margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>{projects[index].title}</h3>
                        <Link href={'/projects/' + projects[index].slug} className="header-cta" style={{ display: 'inline-block' }}><T>{"Explore Project ↗"}</T></Link>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Arrows */}
            {projects.length > 1 && (
                <div style={{ position: 'absolute', top: '50%', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 4vw', zIndex: 15, pointerEvents: 'none', transform: 'translateY(-50%)' }}>
                    <button onClick={prevSlide} aria-label={t("Previous project")} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '50px', height: '50px', pointerEvents: 'auto', backdropFilter: 'blur(5px)', cursor: 'pointer', fontSize: '20px' }}>←</button>
                    <button onClick={nextSlide} aria-label={t("Next project")} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '50px', height: '50px', pointerEvents: 'auto', backdropFilter: 'blur(5px)', cursor: 'pointer', fontSize: '20px' }}>→</button>
                </div>
            )}
        </div>
    );
}
