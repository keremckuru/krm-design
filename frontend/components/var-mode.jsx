'use client';

export default function VarMode() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)', mixBlendMode: 'overlay', opacity: 0.8 }} />

            <div style={{ position: 'absolute', inset: 0, backdropFilter: 'grayscale(70%) contrast(120%) sepia(20%) blur(1px)' }} />

            <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(255,0,0,0.4)', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)' }} />

            <div style={{ position: 'absolute', top: 40, left: 40, background: 'red', color: 'white', padding: '10px 20px', fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase', animation: 'pulse 1s infinite', letterSpacing: 2 }}>
                VAR CHECKING REVIEW...
            </div>

            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 180, border: '15px solid rgba(255,255,255,0.7)', borderRadius: 20 }} />

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
        </div>
    );
}
