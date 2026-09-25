'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePreferences } from './preferences';

export function StackGallery({ images, title }) {
    const { t } = usePreferences();
    const [cards, setCards] = useState(images.map((img, i) => ({ id: i, src: img })));

    const handleDragEnd = (event, info) => {
        // eger saga veya sola yeterince kaydırılırsa
        if (Math.abs(info.offset.x) > 60 || Math.abs(info.offset.y) > 60) {
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
            height: '65vh',
            minHeight: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px',
            marginTop: '20px'
        }}>
            {cards.map((card, index) => {
                const isFront = index === 0;
                // Kartı max 3 tane gösterip geri kalanları gizliyoruz
                const isVisible = index < 3;

                return (
                    <motion.div
                        key={card.id}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            maxWidth: '500px', // Maksimum genislik mobile uygun ancak web'de de tatlı durur
                            height: '100%',
                            transformOrigin: 'bottom center',
                            zIndex: images.length - index,
                            cursor: isFront ? 'grab' : 'default',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: isFront ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                        initial={false}
                        animate={{
                            scale: 1 - index * 0.05,
                            y: index * 25, // Aşağıya doğru kayma efekti
                            opacity: isVisible ? 1 - (index * 0.2) : 0,
                            zIndex: images.length - index,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25
                        }}
                        drag={isFront}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        onDragEnd={isFront ? handleDragEnd : undefined}
                        whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
                        whileTap={{ cursor: 'grabbing' }}
                    >
                        <Image
                            src={card.src}
                            fill
                            style={{ objectFit: 'cover' }}
                            alt={`${title} - view`}
                            priority={isFront}
                            sizes="(max-width: 600px) 100vw, 500px"
                        />
                        {isFront && images.length > 1 && (
                            <div className="swipe-hint" style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                pointerEvents: 'none',
                                backdropFilter: 'blur(4px)'
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
