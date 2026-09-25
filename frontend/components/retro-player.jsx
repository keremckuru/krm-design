'use client';
import { useEffect, useState } from 'react';

export default function RetroPlayer({ onComplete }) {
    const [pos, setPos] = useState(-10);
    const [leg, setLeg] = useState(false);

    useEffect(() => {
        const i = setInterval(() => {
            setPos(p => {
                if (p > 110) {
                    clearInterval(i);
                    onComplete();
                    return p;
                }
                return p + 0.3;
            });
            setLeg(l => !l);
        }, 16);
        return () => clearInterval(i);
    }, [onComplete]);

    return (
        <div style={{ position: 'fixed', bottom: 15, left: `${pos}vw`, zIndex: 999999, transition: 'none', pointerEvents: 'none' }}>
            <div style={{ fontSize: 60, transform: `scaleX(-1) translateY(${leg ? -5 : 0}px)`, filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>
                🏃‍♂️<span style={{ fontSize: 30, position: 'absolute', bottom: 0, left: -20, transform: `rotate(${pos * 10}deg)` }}>⚽</span>
            </div>
        </div>
    );
}
