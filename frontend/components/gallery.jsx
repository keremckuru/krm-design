'use client';
import { useRef, useState } from 'react';
import { usePreferences } from './preferences';
import Image from 'next/image';
export function Gallery({ images, title, compact = false, href = null }) {
    const { t } = usePreferences();
    const [slide, setSlide] = useState(0);
    const start = useRef(0);
    const swiped = useRef(false);
    const next = (n) => { setSlide(s => (s + n + images.length) % images.length); };
    return <div className={'gallery ' + (compact ? 'compact' : '')} onTouchStart={e => { start.current = e.touches[0].clientX; swiped.current = false; }} onTouchEnd={e => {
        const d = start.current - e.changedTouches[0].clientX; if (Math.abs(d) > 45) {
            swiped.current = true;
            next(d > 0 ? 1 : -1);
        }
    }}>
        <a href={href || '#'} className="gallery-open" aria-label={t('View project') + ' — ' + title} onClick={(e) => {
            if (swiped.current || !href) {
                e.preventDefault();
                swiped.current = false;
            }
        }}>
            <Image src={images[slide]} width={1200} height={1200} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} sizes={compact ? '(max-width:640px) 50vw, 33vw' : '100vw'} alt={title + ' — ' + (slide + 1)} priority={!compact} />
            {href && <span className="expand-hint" aria-hidden="true">↗</span>}
        </a>

        {images.length > 1 && (
            <div className="gallery-controls">
                <button type="button" aria-label={t('Previous image')} onClick={() => next(-1)}>←</button>
                <span>{slide + 1} / {images.length}</span>
                <button type="button" aria-label={t('Next image')} onClick={() => next(1)}>→</button>
            </div>
        )}
    </div>;
}
