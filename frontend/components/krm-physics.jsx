'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const HeavyPhysicsCanvas = dynamic(() => import('./heavy-physics-canvas'), { ssr: false });

export function KRMPhysics() {
    const [active, setActive] = useState(false);

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

    if (!active) return null;
    return <HeavyPhysicsCanvas />;
}
