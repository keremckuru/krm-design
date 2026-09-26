'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePreferences } from './preferences';

export function StackGallery({ images, title }) {
    const { t } = usePreferences();
    const [cards, setCards] = useState(images.map((img, i) => ({ id: i, src: img })));

    const handleDragEnd = (event, info) => {
        // Sadece sağa ve sola kaydırmaya izin ver
        if (Math.abs(info.offset.x) > 60) {
            setCards(prev => {
                const newCards = [...prev];
                const front = newCards.shift();
                newCards.push(front);
                return newCards;
            });
        }
    };

    if (images.length === 0) return null;

    return (
        <div className="stack-gallery-wrapper" style={{
            position: 'relative',
            width: '100%',
            height: '70vh',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px',
            marginTop: '20px'
        }}>
            {cards.map((card, index) => {
                const isFront = index === 0;
                const isVisible = index < 3;

                return (
                    <motion.div
                        key={card.id}
                        style={{
                            position: 'absolute',
                            width: '90%',
                            maxWidth: '400px',
                            height: '80%',
                            transformOrigin: 'bottom center',
                            zIndex: images.length - index,
                            cursor: isFront ? 'grab' : 'default',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: isFront ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.1)',
                            background: 'rgba(0,0,0,0.03)'
                        }}
                        initial={false}
                        animate={{
                            scale: 1 - index * 0.05,
                            y: index * 25,
                            opacity: isVisible ? 1 - (index * 0.2) : 0,
                            zIndex: images.length - index,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25
                        }}
                        drag={isFront ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={isFront ? handleDragEnd : undefined}
                        whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
                        whileTap={{ cursor: 'grabbing' }}
                    >
                        <Image
                            src={card.src}
                            fill
                            style={{ objectFit: 'contain' }}
                            alt={`${title} - view ${card.id + 1}`}
                            priority={isFront}
                            sizes="(max-width: 600px) 100vw, 500px"
                        />

                        {isFront && images.length > 1 && (
                            <div className="swipe-hint" style={{
                                position: 'absolute',
                                top: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                pointerEvents: 'none',
                                backdropFilter: 'blur(4px)',
                                whiteSpace: 'nowrap'
                            }}>
                                <span>{t('Swipe to view')}</span>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
