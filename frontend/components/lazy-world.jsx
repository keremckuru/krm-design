'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
const World = dynamic(() => import('./world-index').then(m => m.WorldIndex), { ssr: false, loading: () => <p role="status">Loading world…</p> });
export function LazyWorld({ projects }) { const ref = useRef(null), [visible, setVisible] = useState(false); useEffect(() => { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '50px' }); observer.observe(ref.current); return () => observer.disconnect(); }, []); return <div ref={ref} style={{ minHeight: '32rem' }}>{visible && <World projects={projects} />}</div>; }
