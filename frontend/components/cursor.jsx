'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    
    const springConfig = { damping: 35, stiffness: 700, mass: 0.1 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const update = (e) => {
            cursorX.set(e.clientX - 10);
            cursorY.set(e.clientY - 10);
        };
        const handleMouseOver = (e) => {
            setIsHovering(!!e.target.closest('a, button, summary, input'));
        };

        window.addEventListener('mousemove', update);
        window.addEventListener('mouseover', handleMouseOver);
        return () => {
            window.removeEventListener('mousemove', update);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className="custom-cursor"
            aria-hidden="true"
            style={{ 
                x: cursorXSpring, 
                y: cursorYSpring,
                pointerEvents: 'none', 
                mixBlendMode: 'difference', 
                background: 'white', 
                zIndex: 999999 
            }}
            animate={{
                scale: isHovering ? 2.5 : 1,
            }}
            transition={{
                type: "spring",
                mass: 0.1,
                stiffness: 700,
                damping: 35
            }}
        />
    );
}
