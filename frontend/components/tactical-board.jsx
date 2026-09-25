'use client';
import { useState, useRef } from 'react';

export default function TacticalBoard({ onClose }) {
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const isDrawing = useRef(false);

    const handlePointerDown = (e) => {
        isDrawing.current = true;
        setCurrentLine([{ x: e.clientX, y: e.clientY }]);
    };
    const handlePointerMove = (e) => {
        if (!isDrawing.current) return;
        setCurrentLine(prev => [...prev, { x: e.clientX, y: e.clientY }]);
    };
    const handlePointerUp = () => {
        isDrawing.current = false;
        if (currentLine.length > 0) {
            setLines(prev => [...prev, currentLine]);
            setCurrentLine([]);
        }
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
                position: 'fixed', inset: 0, zIndex: 999998,
                backgroundColor: '#1a3b22', // Deep pitch green
                cursor: 'crosshair', touchAction: 'none'
            }}
        >
            <div style={{ position: 'absolute', top: 15, left: 15, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>TACTICAL BOARD ENGAGED. DRAW YOUR SYSTEM.</div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: 'absolute', top: 20, right: 30, zIndex: 10, background: '#000', color: '#fff', border: '1px solid #333', padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}>EXIT PITCH</button>
            <button onClick={(e) => { e.stopPropagation(); setLines([]); }} style={{ position: 'absolute', top: 20, right: 150, zIndex: 10, background: '#000', color: '#fff', border: '1px solid #333', padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace' }}>CLEAR</button>

            {/* Pitch Markings */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 250, border: '4px solid rgba(255,255,255,0.3)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, background: 'rgba(255,255,255,0.3)', pointerEvents: 'none', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: '30vw', height: '10px', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: '30vw', height: '10px', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 30, bottom: 30, left: 30, right: 30, border: '4px solid rgba(255,255,255,0.3)', pointerEvents: 'none' }} />

            <svg style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }}>
                {lines.map((l, i) => (
                    <polyline key={i} points={l.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {currentLine.length > 0 && (
                    <polyline points={currentLine.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                )}
            </svg>
        </div>
    );
}
