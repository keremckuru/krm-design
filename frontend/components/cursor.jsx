'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor() {
    const [mouse, setMouse] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const update = (e) => {
            setMouse({ x: e.clientX, y: e.clientY });
        };
        const handleMouseOver = (e) => {
            if (e.target.closest('a, button, summary, input')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', update);
        window.addEventListener('mouseover', handleMouseOver);
        return () => {
            window.removeEventListener('mousemove', update);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <motion.div
            className="custom-cursor"
            aria-hidden="true"
            style={{ pointerEvents: 'none', mixBlendMode: 'difference', background: 'white', zIndex: 999999 }}
            animate={{
                x: mouse.x - (isHovering ? 10 : 10),
                y: mouse.y - (isHovering ? 10 : 10),
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
