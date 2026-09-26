'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePreferences } from './preferences';

export function DesktopGallery({ images, title }) {
    const { t } = usePreferences();
    const [index, setIndex] = useState(0);

    const nextSlide = () => setIndex((i) => (i + 1) % images.length);
    const prevSlide = () => setIndex((i) => (i - 1 + images.length) % images.length);

    // Autoplay feature
    useEffect(() => {
        if (images.length <= 1) return;
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;

        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, 2000);

        return () => clearInterval(timer);
    }, [images.length]);

    if (images.length === 0) return null;

    return (
        <div 
            style={{
                position: 'relative',
                width: '100%',
                height: '80vh',
                minHeight: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                perspective: '1000px',
                marginTop: '30px',
                marginBottom: '60px',
                overflow: 'hidden'
            }}
        >
            <AnimatePresence initial={false} custom={index}>
                {images.map((src, i) => {
                    const len = images.length;
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
                            key={i}
                            custom={realDiff}
                            initial={{ opacity: 0, x: Math.sign(realDiff) * 150 + '%', scale: 0.5 }}
                            animate={{
                                opacity: abs > 2 ? 0 : 1,
                                x: x,
                                scale: scale,
                                zIndex: zIndex,
                                filter: filter
                            }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{
                                position: 'absolute',
                                width: 'clamp(280px, 40vw, 650px)',
                                aspectRatio: '3/4',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                backgroundColor: 'transparent',
                                boxShadow: isCenter ? '0 40px 80px rgba(0,0,0,0.25)' : '0 15px 30px rgba(0,0,0,0.1)',
                                cursor: isCenter ? 'default' : 'pointer'
                            }}
                            onClick={() => {
                                if (realDiff > 0) nextSlide();
                                else if (realDiff < 0) prevSlide();
                            }}
                        >
                            <Image
                                src={src}
                                fill
                                style={{ objectFit: 'cover', background: 'transparent' }}
                                alt={`${title} - slide ${i + 1}`}
                                priority={isCenter}
                                sizes="(max-width: 768px) 100vw, 60vw"
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {images.length > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    display: 'flex',
                    gap: '20px',
                    zIndex: 20
                }}>
                    <button onClick={prevSlide} aria-label={t("Previous image")} style={{
                        background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%',
                        width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
                    }}>←</button>
                    <button onClick={nextSlide} aria-label={t("Next image")} style={{
                        background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%',
                        width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
                    }}>→</button>
                </div>
            )}
        </div>
    );
}
