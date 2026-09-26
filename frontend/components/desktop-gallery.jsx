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
                height: '70vh',
                minHeight: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                perspective: '1000px',
                marginTop: '10px',
                marginBottom: '40px',
                overflow: 'hidden'
            }}
        >
            <AnimatePresence initial={false} custom={index}>
                {images.map((src, i) => {
                    const diff = i - index;
                    if (Math.abs(diff) > 2 && !(i === 0 && index === images.length - 1) && !(i === images.length - 1 && index === 0)) return null;

                    let realDiff = diff;
                    if (images.length > 1) {
                        if (i === 0 && index === images.length - 1) realDiff = 1;
                        if (i === images.length - 1 && index === 0) realDiff = -1;
                    }

                    const isCenter = realDiff === 0;

                    return (
                        <motion.div
                            key={i}
                            custom={realDiff}
                            layout
                            initial={{ opacity: 0, x: Math.sign(realDiff) * 300, scale: 0.8 }}
                            animate={{
                                opacity: Math.abs(realDiff) > 1 ? 0 : 1,
                                x: realDiff * 450,
                                scale: isCenter ? 1 : 0.7,
                                zIndex: isCenter ? 10 : 5 - Math.abs(realDiff),
                                filter: isCenter ? 'brightness(1)' : 'brightness(0.5)'
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            style={{
                                position: 'absolute',
                                width: '38vw',
                                maxWidth: '650px',
                                height: '90%',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                backgroundColor: 'transparent',
                                boxShadow: isCenter ? '0 40px 80px rgba(0,0,0,0.3)' : '0 15px 40px rgba(0,0,0,0.15)',
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
                                sizes="50vw"
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
