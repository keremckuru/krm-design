'use client';
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePreferences } from './preferences';

function StackCard({ card, index, total, isFront, isVisible, handleDragEnd, t }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-250, 250], [-10, 10]);

    return (
        <motion.div
            style={{
                position: 'absolute', width: '90%', maxWidth: '400px', height: '80%',
                transformOrigin: 'bottom center', zIndex: total - index,
                cursor: isFront ? 'grab' : 'default', borderRadius: '16px', overflow: 'hidden',
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
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={isFront ? handleDragEnd : undefined}
            whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
            whileTap={{ cursor: 'grabbing' }}
        >
            <Image src={card.images[0]} fill style={{ objectFit: 'contain' }} alt={card.title} priority={isFront} sizes="(max-width: 600px) 100vw, 500px" />

            {isFront && (
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '16px', borderRadius: '12px', backdropFilter: 'blur(10px)', pointerEvents: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, opacity: 0.7 }}>{card.year} / {card.country}</p>
                        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px' }}>{card.originalIndex + 1} / {total}</span>
                    </div>
                    <h3 style={{ fontSize: '20px', margin: '0 0 10px 0' }}>{card.title}</h3>
                    <Link href={'/projects/' + card.slug} style={{ display: 'inline-block', fontSize: '14px', fontWeight: 600, color: 'var(--acid)', textDecoration: 'none' }}>Explore Project ↗</Link>
                </div>
            )}
            {isFront && total > 1 && (
                <div className="swipe-hint" style={{
                    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.5)', color: 'white', padding: '6px 14px', borderRadius: '20px',
                    fontSize: '12px', pointerEvents: 'none', backdropFilter: 'blur(4px)'
                }}>
                    <span>{t('Swipe to view')}</span>
                </div>
            )}
        </motion.div>
    );
}

export function HomeStackSlider({ projects }) {
    const { t } = usePreferences();
    const [cards, setCards] = useState(projects.map((p, i) => ({ ...p, id: p.slug, originalIndex: i })));

    const handleDragEnd = (event, info) => {
        if (Math.abs(info.offset.x) > 60) {
            setCards(prev => {
                const newCards = [...prev];
                const front = newCards.shift();
                newCards.push(front);
                return newCards;
            });
        }
    };

    if (projects.length === 0) return null;

    return (
        <div style={{
            position: 'relative', width: '100%', height: '70vh', minHeight: '400px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            marginBottom: '40px', marginTop: '20px'
        }}>
            {cards.map((card, index) => (
                <StackCard
                    key={card.id}
                    card={card}
                    index={index}
                    total={projects.length}
                    isFront={index === 0}
                    isVisible={index < 3}
                    handleDragEnd={handleDragEnd}
                    t={t}
                />
            ))}
        </div>
    );
}
