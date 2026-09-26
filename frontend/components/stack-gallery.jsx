'use client';
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { usePreferences } from './preferences';

function StackCard({ card, index, total, title, isFront, isVisible, handleDragEnd, t }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-250, 250], [-10, 10]);

    return (
        <motion.div
            style={{
                position: 'absolute',
                width: '90%',
                maxWidth: '400px',
                height: '80%',
                transformOrigin: 'bottom center',
                zIndex: total - index,
                cursor: isFront ? 'grab' : 'default',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: isFront ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.1)',
                background: 'rgba(0,0,0,0.03)',
                x: isFront ? x : 0,
                rotate: isFront ? rotate : 0,
            }}
            initial={false}
            animate={{
                scale: 1 - index * 0.05,
                y: index * 25,
                opacity: isVisible ? 1 - (index * 0.2) : 0,
                zIndex: total - index,
                x: 0,
                rotate: 0
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

            {isFront && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                    backdropFilter: 'blur(4px)'
                }}>
                    {card.originalIndex + 1} / {total}
                </div>
            )}

            {isFront && total > 1 && (
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
}

export function StackGallery({ images, title }) {
    const { t } = usePreferences();
    const [cards, setCards] = useState(images.map((img, i) => ({ id: i, src: img, originalIndex: i })));

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
            {cards.map((card, index) => (
                <StackCard
                    key={card.id}
                    card={card}
                    index={index}
                    total={images.length}
                    title={title}
                    isFront={index === 0}
                    isVisible={index < 3}
                    handleDragEnd={handleDragEnd}
                    t={t}
                />
            ))}
        </div>
    );
}
