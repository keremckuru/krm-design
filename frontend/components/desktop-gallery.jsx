'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function DesktopGallery({ images, title }) {
    const [index, setIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const nextSlide = () => setIndex((i) => (i + 1) % images.length);
    const prevSlide = () => setIndex((i) => (i - 1 + images.length) % images.length);

    // Autoplay feature
    useEffect(() => {
        // Pause autoplay if modal is open or only 1 image exists
        if (modalOpen || images.length <= 1) return;

        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, 2000); // changes every 2 seconds

        return () => clearInterval(timer);
    }, [modalOpen, images.length]);

    if (images.length === 0) return null;

    return (
        <>
            <div style={{
                position: 'relative',
                width: '100%',
                height: '70vh', // increased slightly to give the images more breathing room
                minHeight: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                perspective: '1000px',
                marginTop: '10px',
                marginBottom: '40px',
                overflow: 'hidden'
            }}>
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
                                    width: '55vw',
                                    maxWidth: '800px',
                                    height: '100%',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    // background added so that 'contain' doesn't show sharp cuts on transparent sides
                                    backgroundColor: isCenter ? 'rgba(0,0,0,0.03)' : 'transparent',
                                    boxShadow: isCenter ? '0 30px 60px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.1)',
                                    cursor: isCenter ? 'zoom-in' : 'pointer'
                                }}
                                onClick={() => {
                                    if (realDiff > 0) nextSlide();
                                    else if (realDiff < 0) prevSlide();
                                    else setModalOpen(true);
                                }}
                            >
                                <Image
                                    src={src}
                                    fill
                                    style={{ objectFit: 'contain' }} // Ensures the shape spans without being cut (minimal kırpma)
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
                        <button onClick={prevSlide} style={{
                            background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%',
                            width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
                        }}>←</button>
                        <button onClick={nextSlide} style={{
                            background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%',
                            width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
                        }}>→</button>
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999999, // ensures it sits above the cursor and everything else
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {/* Logo Left Top */}
                        <div style={{ position: 'absolute', top: '3vw', left: '3vw', zIndex: 1000000 }}>
                            <Link href="/" className="wordmark" style={{ textDecoration: 'none' }}>
                                <Image src="/krmIconLightMode.png" alt="KRM Design" width={110} height={40} className="logo-img logo-light" priority />
                                <Image src="/krmIconDarkMode.png" alt="KRM Design" width={110} height={40} className="logo-img logo-dark" priority />
                            </Link>
                        </div>

                        {/* Close button Right Top */}
                        <button onClick={() => setModalOpen(false)} style={{
                            position: 'absolute', top: '2vw', right: '3vw',
                            background: 'transparent', border: 'none', color: 'white',
                            fontSize: '48px', fontWeight: 300, cursor: 'pointer', zIndex: 1000000,
                            lineHeight: 1
                        }}>
                            ×
                        </button>

                        {/* Modal Image Display */}
                        <div style={{ position: 'relative', width: '90vw', height: '90vh' }}>
                            <Image
                                src={images[index]}
                                fill
                                style={{ objectFit: 'contain' }}
                                alt={title}
                                priority
                                sizes="100vw"
                            />
                        </div>

                        {/* Modal Controls (Optional, allowing inspection of multiple inside the modal) */}
                        {images.length > 1 && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} style={{
                                    position: 'absolute', left: '2vw', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', color: 'white', fontSize: '36px', cursor: 'pointer', zIndex: 1000000
                                }}>←</button>
                                <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} style={{
                                    position: 'absolute', right: '2vw', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', color: 'white', fontSize: '36px', cursor: 'pointer', zIndex: 1000000
                                }}>→</button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
