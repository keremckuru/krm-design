'use client';
import Image from 'next/image';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef, useState } from 'react';
import { PreferenceControls, T, usePreferences } from './preferences';
async function readResponse(r) { const data = await r.json(); if (!r.ok) throw new Error(data.error || 'Request failed.'); return data; }
const fingerprint = value => JSON.stringify(Object.fromEntries(Object.entries(value).filter(([key]) => !['order', 'updated', 'revision'].includes(key))));
const blank = { slug: '', title: '', team: '', country: 'Türkiye', kind: 'Club', brand: '', year: '2026', description: '', images: [], status: 'Concept', published: false, featured: false };
export function AdminPanel() {
    const { t } = usePreferences();
    const imageDrag = useRef(null);
    const [saved, setSaved] = useState(fingerprint({ ...blank })), [trash, setTrash] = useState([]), [orderRevision, setOrderRevision] = useState(1), [settingsReady, setSettingsReady] = useState(false), [savedSettings, setSavedSettings] = useState('');
    function choose(item) { if (fingerprint(p) !== saved && !window.confirm(t('Discard unsaved changes?'))) return; setP({ ...item }); setOriginal(item.slug || ''); setSaved(fingerprint(item)); }
    async function loadTrash() { try { setTrash(await readResponse(await fetch('/api/projects?trash=1'))); } catch (error) { setMsg(error.message); } }
    const projectDrag = useRef(null);
    const [original, setOriginal] = useState('');
    const [searchQ, setSearchQ] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selected, setSelected] = useState(new Set());
    const [list, setList] = useState([]), [p, setP] = useState({ ...blank }), [tab, setTab] = useState('Projects'), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false), [inbox, setInbox] = useState([]), [settings, setSettings] = useState({ email: '', terms: '' });
    async function load() {
        try {
            const r = await fetch('/api/projects');
            if (!r.ok)
                throw new Error();
            setOrderRevision(Number(r.headers.get('X-Order-Revision'))); setList(await r.json());
        }
        catch {
            setMsg('Could not load projects. Please refresh.');
        }
    }
    useEffect(() => { load(); loadTrash(); fetch('/api/inquiries').then(readResponse).then(setInbox).catch(error => setMsg(error.message)); fetch('/api/settings').then(readResponse).then(s => { setSettings(s); setSavedSettings(JSON.stringify(s)); setSettingsReady(true); }).catch(() => setMsg('Could not load settings. Please refresh before editing.')); }, []);
    const dirty = fingerprint(p) !== saved || (settingsReady && JSON.stringify(settings) !== savedSettings);
    useEffect(() => { if (!dirty) return; const leave = event => { event.preventDefault(); event.returnValue = ''; }; const click = event => { const link = event.target.closest('a[href]'); if (link && link.target !== '_blank' && !window.confirm(t('Discard unsaved changes?'))) { event.preventDefault(); event.stopPropagation(); } }; window.addEventListener('beforeunload', leave); document.addEventListener('click', click, true); return () => { window.removeEventListener('beforeunload', leave); document.removeEventListener('click', click, true); }; }, [dirty, t]);
    async function reorder(from, to) {
        if (busy || from === to)
            return; const ordered = [...list]; ordered.splice(to, 0, ordered.splice(from, 1)[0]); setBusy(true); try {
                const r = await fetch('/api/projects', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slugs: ordered.map(p => p.slug), orderRevision }) });
                const result = await readResponse(r); setOrderRevision(result.orderRevision);
                setList(ordered.map((v, order) => ({ ...v, order })));
                setP(v => ({ ...v, order: Math.max(0, ordered.findIndex(i => i.slug === v.slug)) }));
                setMsg('Project order saved.');
            }
        catch {
            setMsg('Could not reorder projects.');
            await load();
        }
        finally {
            setBusy(false);
        }
    }
    function moveImage(from, to) { setP(v => { const images = [...v.images]; images.splice(to, 0, images.splice(from, 1)[0]); return { ...v, images }; }); }
    async function remove() {
        if (!original)
            return; setBusy(true); try {
                const r = await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: original, revision: p.revision }) });
                await readResponse(r);
                setP({ ...blank, images: [] }); setSaved(fingerprint({ ...blank, images: [] })); await loadTrash();
                setOriginal('');
                await load();
                setMsg('Project deleted.');
            }
        catch (error) {
            setMsg(error.message);
        }
        finally {
            setBusy(false);
        }
    }
    async function save() {
        setBusy(true); try {
            const r = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, originalSlug: original }) });
            const result = await readResponse(r); setP(result); setSaved(fingerprint(result));
            setOriginal(p.slug);
            setMsg(p.published ? 'Project published.' : 'Draft saved.');
            await load();
        }
        catch (error) {
            setMsg(error.message);
        }
        finally {
            setBusy(false);
        }
    }

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeys = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (tab === 'Projects' && !busy) save();
            }
            if (e.key === 'Escape') {
                if (tab === 'Projects' && !busy && original) {
                    if (dirty && !window.confirm(t('Discard unsaved changes?'))) return;
                    choose({ ...blank, images: [], order: list.length, homepage: true });
                    setOriginal('');
                }
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [save, busy, tab, original, dirty, t]);

    async function bulkAction(type) {
        if (!window.confirm(t(`Are you sure you want to ${type} ${selected.size} projects?`))) return;
        setBusy(true);
        try {
            const slugs = Array.from(selected);
            await Promise.all(slugs.map(async slug => {
                const item = list.find(l => l.slug === slug);
                if (!item) return;
                if (type === 'delete') {
                    return fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, revision: item.revision }) });
                } else if (type === 'publish' || type === 'draft') {
                    // Since catalog is monolithic again, item is the full object
                    return fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, published: type === 'publish', originalSlug: slug }) });
                }
            }));
            let opMap = { publish: 'published', draft: 'set to draft', delete: 'deleted' };
            setMsg(`Successfully ${t(opMap[type])} ${selected.size} projects.`);
            setSelected(new Set());
            await load();
            if (type === 'delete') await loadTrash();
        } catch (e) {
            setMsg(e.message);
        } finally {
            setBusy(false);
        }
    }
    async function compressImage(file) {
        if (file.size < 1024 * 1024 && file.type === 'image/webp') return file;
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                let { width, height } = img;
                const max = 2000;
                if (width > max || height > max) {
                    if (width > height) { height = Math.round(height * max / width); width = max; }
                    else { width = Math.round(width * max / height); height = max; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => {
                    if (!blob) return resolve(file);
                    resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' }));
                }, 'image/webp', 0.85);
            };
            img.onerror = () => resolve(file);
            img.src = url;
        });
    }

    async function upload(files) {
        if (!files) return;
        setBusy(true);
        setMsg('Optimizing and uploading…');
        try {
            if (p.images.length + files.length > 30) throw new Error('A project can contain up to 30 images.');
            for (let file of Array.from(files)) {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose JPG, PNG or WebP images.');

                if (file.size > 2 * 1024 * 1024) {
                    setMsg('Compressing large image before upload…');
                    file = await compressImage(file);
                }

                if (file.size > 12 * 1024 * 1024) throw new Error('Choose JPG, PNG or WebP images under 12 MB.');

                const form = new FormData();
                form.set('file', file);
                const result = await readResponse(await fetch('/api/upload', { method: 'POST', body: form }));
                setP(value => ({ ...value, images: [...value.images, result.url] }));
            }
            setMsg('Images ready. Save the project to keep this order.');
        } catch (error) {
            setMsg(error.message + ' Successfully uploaded images remain in this draft. Save to keep them.');
        } finally {
            setBusy(false);
        }
    }
    return <main className="admin"><header><a href="/"><Image src="/krmIconDarkMode.png" alt="KRM Design" width={28} height={28} className="logo-dark" style={{ verticalAlign: 'middle', borderRadius: '4px' }} /><Image src="/krmIconLightMode.png" alt="KRM Design" width={28} height={28} className="logo-light" style={{ verticalAlign: 'middle', borderRadius: '4px' }} /></a><span><T>{"Studio management"}</T></span><PreferenceControls /><button disabled={busy} onClick={async () => { if (dirty && !window.confirm(t('Discard unsaved changes?'))) return; try { await readResponse(await fetch('/api/auth/logout', { method: 'POST' })); location.assign('/admin/login'); } catch (error) { setMsg(error.message); } }}><T>Sign out</T></button></header><div className="admin-tabs">{['Projects', 'Inquiries', 'Settings'].map(t => <button disabled={busy} aria-pressed={t === tab} key={t} onClick={() => setTab(t)}><T>{t}</T></button>)}</div><p role="status"><T>{msg}</T>{dirty && <span className="unsaved-indicator"> · <T>Unsaved changes</T></span>}</p>{tab === 'Projects' && <div className="admin-layout"><aside><button className="solid-button" disabled={busy} onClick={() => choose({ ...blank, images: [], order: list.length, homepage: true })}><T>{"+ New project"}</T></button><p className="admin-hint"><T>{"Drag to reorder projects or use the arrows. Unfiltered state required to reorder."}</T></p>

        <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 6px 12px' }}>
            <input className="admin-search-input" style={{ margin: 0 }} placeholder={t('Search projects...')} value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px' }}>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 9999 }}>
                        <SelectItem value="All"><T>{"All Types"}</T></SelectItem>
                        <SelectItem value="Club"><T>{"Club"}</T></SelectItem>
                        <SelectItem value="National"><T>{"National"}</T></SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 9999 }}>
                        <SelectItem value="All"><T>{"All Statuses"}</T></SelectItem>
                        <SelectItem value="Published"><T>{"Published"}</T></SelectItem>
                        <SelectItem value="Draft"><T>{"Draft"}</T></SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {list.map((item, index) => {
            let hidden = false;
            if (searchQ && !item.title.toLowerCase().includes(searchQ.toLowerCase())) hidden = true;
            if (filterCategory !== 'All' && item.kind !== filterCategory) hidden = true;
            if (filterStatus === 'Published' && !item.published) hidden = true;
            if (filterStatus === 'Draft' && item.published) hidden = true;
            if (hidden) return null;

            const canDrag = !searchQ && filterCategory === 'All' && filterStatus === 'All' && !busy;

            return <div className="admin-project-row" key={item.slug} draggable={canDrag} onDragStart={() => projectDrag.current = index} onDragOver={e => e.preventDefault()} onDrop={e => {
                e.preventDefault(); if (projectDrag.current !== null && canDrag)
                    reorder(projectDrag.current, index); projectDrag.current = null;
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>
                    <input type="checkbox" className="modern-toggle" style={{ width: '16px', height: '16px' }} checked={selected.has(item.slug)} onChange={e => {
                        const s = new Set(selected);
                        if (e.target.checked) s.add(item.slug); else s.delete(item.slug);
                        setSelected(s);
                    }} />
                </div>
                <button disabled={busy} className="admin-project" aria-current={original === item.slug ? 'true' : undefined} onClick={() => choose(item)}>
                    <span aria-hidden="true">⠿ </span>{item.title}
                    <small><T>{item.published ? 'Published' : 'Draft'}</T> {item.homepage !== false ? '· ⌂' : ''} {item.featured ? '· ★' : ''}</small>
                </button>
                <div className="order-buttons" style={{ opacity: canDrag ? 1 : 0.3, pointerEvents: canDrag ? 'auto' : 'none' }}>
                    <button disabled={!canDrag || index === 0} aria-label={t('Move to top')} onClick={() => reorder(index, 0)}>⇈</button>
                    <button disabled={!canDrag || index === 0} aria-label={t('Move project earlier')} onClick={() => reorder(index, index - 1)}>↑</button>
                    <button disabled={!canDrag || index === list.length - 1} aria-label={t('Move project later')} onClick={() => reorder(index, index + 1)}>↓</button>
                </div>
            </div>
        })}
        {selected.size > 0 && (
            <div style={{ position: 'sticky', bottom: '16px', background: 'var(--admin-surface-2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'flex', gap: '8px', zIndex: 99, alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>{selected.size} <T>{"selected"}</T></span>
                <div style={{ flex: 1 }} />
                <button className="solid-button" disabled={busy} style={{ minWidth: 0, width: 'auto', padding: '6px 12px', fontSize: '12px' }} onClick={() => bulkAction('publish')}><T>{"Publish"}</T></button>
                <button className="solid-button" disabled={busy} style={{ minWidth: 0, width: 'auto', padding: '6px 12px', fontSize: '12px' }} onClick={() => bulkAction('draft')}><T>{"Draft"}</T></button>
                <button disabled={busy} style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--admin-danger)' }} onClick={() => bulkAction('delete')}><T>{"Trash"}</T></button>
            </div>
        )}

        <details className="trash-panel"><summary><T>Trash</T> ({trash.length})</summary>{trash.map(item => <div className="admin-project-row" key={item.slug}><span>{item.title}</span><button disabled={busy} onClick={async () => { setBusy(true); try { await readResponse(await fetch('/api/projects/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: item.slug, revision: item.revision }) })); await load(); await loadTrash(); setMsg('Restored as draft.'); } catch (error) { setMsg(error.message); } finally { setBusy(false); } }}><T>Restore</T></button></div>)}</details></aside><section><h1>{p.title || t('New project')}</h1><datalist id="country-suggestions">{[...new Set(list.map(i => i.country).filter(Boolean))].map(c => <option key={c} value={c} />)}</datalist><datalist id="brand-suggestions">{[...new Set(list.map(i => i.brand).filter(Boolean))].map(b => <option key={b} value={b} />)}</datalist><fieldset className="inquiry-form" disabled={busy}>{['title', 'slug', 'team', 'country', 'brand', 'year'].map(key => <label key={key}><T>{key}</T><input disabled={busy || (key === 'slug' && !!original)} value={p[key]} onChange={e => setP({ ...p, [key]: e.target.value })} list={key === 'country' ? 'country-suggestions' : key === 'brand' ? 'brand-suggestions' : undefined} /></label>)}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--admin-muted)' }}><T>{"Type"}</T></span>
                <Select disabled={busy} value={p.kind} onValueChange={v => setP({ ...p, kind: v })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 9999 }}>
                        <SelectItem value="Club"><T>{"Club"}</T></SelectItem>
                        <SelectItem value="National"><T>{"National"}</T></SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--admin-muted)' }}><T>{"Status"}</T></span>
                <Select disabled={busy} value={p.status} onValueChange={v => setP({ ...p, status: v })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: 9999 }}>
                        <SelectItem value="Concept"><T>{"Concept"}</T></SelectItem>
                        <SelectItem value="Commissioned"><T>{"Commissioned"}</T></SelectItem>
                        <SelectItem value="Produced"><T>{"Produced"}</T></SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <label className="wide"><T>{"Description"}</T><textarea rows={5} value={p.description} onChange={e => setP({ ...p, description: e.target.value })} /></label>

            <div className="visibility-card wide">
                <h3><T>{"Visibility & Homepage Strategy"}</T></h3>
                <div className="visibility-group">
                    <label className="toggle-label">
                        <div className="toggle-text">
                            <strong><T>{"Published"}</T></strong>
                            <span><T>{"Make project visible on the site"}</T></span>
                        </div>
                        <input type="checkbox" className="modern-toggle" checked={p.published} onChange={e => setP({ ...p, published: e.target.checked })} />
                    </label>
                    <label className="toggle-label">
                        <div className="toggle-text">
                            <strong><T>{"Show on homepage"}</T></strong>
                            <span><T>{"Display this project in the main portfolio stream"}</T></span>
                        </div>
                        <input type="checkbox" className="modern-toggle" checked={p.homepage !== false} onChange={e => setP({ ...p, homepage: e.target.checked })} />
                    </label>
                    <label className="toggle-label hero-candidate-label">
                        <div className="toggle-text">
                            <strong><T>{"Set as Hero candidate"}</T></strong>
                            <span><T>{"Pin this as the massive cover on the homepage. (The first one sorted takes priority)"}</T></span>
                        </div>
                        <input type="checkbox" className="modern-toggle" checked={p.featured} onChange={e => setP({ ...p, featured: e.target.checked })} />
                    </label>
                </div>
            </div>

            <label className="wide upload-zone"><T>{"Add project images"}</T><input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => upload(e.target.files)} /><small><T>{"Automatically optimized to WebP. The first image is your cover."}</T></small></label></fieldset><div className="admin-images">{p.images.map((url, i) => <div key={url + String(i)} draggable={!busy} onDragStart={() => imageDrag.current = i} onDragOver={e => e.preventDefault()} onDrop={e => {
                e.preventDefault(); if (imageDrag.current !== null)
                    moveImage(imageDrag.current, i); imageDrag.current = null;
            }}><img draggable={false} src={url} alt={'Slide ' + (i + 1)} /><span>{i === 0 ? t('Cover') : i + 1}</span><button aria-label={t("Move image earlier")} disabled={busy || !i} onClick={() => { const a = [...p.images];[a[i - 1], a[i]] = [a[i], a[i - 1]]; setP({ ...p, images: a }); }}>←</button><button aria-label={t("Move image later")} disabled={busy || i === p.images.length - 1} onClick={() => moveImage(i, i + 1)}>→</button><button aria-label={t("Remove image from project")} disabled={busy} onClick={() => setP({ ...p, images: p.images.filter((_, j) => j !== i) })}><T>{"Remove"}</T></button></div>)}</div><button className="solid-button" onClick={save} disabled={busy}>{t(busy ? 'Working…' : 'Save project')}</button>{original && <AlertDialog><AlertDialogTrigger asChild><button className="delete-project" disabled={busy}><T>{"Delete project"}</T></button></AlertDialogTrigger><AlertDialogContent className="delete-dialog"><AlertDialogTitle>{t("Delete project")}</AlertDialogTitle><AlertDialogDescription>{p.title} — {t("Delete this project? This removes it from the site.")}</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>{t("Cancel")}</AlertDialogCancel><AlertDialogAction onClick={remove}>{t("Delete project")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}{p.published && <a className="preview-link" href={'/projects/' + p.slug} target="_blank"><T>{"View published project ↗"}</T></a>}</section></div>}{tab === 'Inquiries' && <section><h1><T>{"Project inquiries"}</T></h1>{!inbox.length && <p><T>{"No inquiries yet."}</T></p>}{inbox.map(row => { const d = JSON.parse(row.data); return <article className="inbox-item" key={row.id}><p className="eyebrow">{row.created}</p><h2>{d.name} / {d.company}</h2><p>{d.service} · {d.budget} · {d.deadline || 'Flexible deadline'}</p><p style={{ whiteSpace: 'pre-wrap' }}>{d.message}</p><a href={'mailto:' + d.email}><T>{"Reply to"}</T> {d.email} ↗</a></article>; })}</section>}{tab === 'Settings' && <section className="settings-form"><h1><T>{"Studio settings"}</T></h1><label><T>{"Public contact email"}</T><input disabled={!settingsReady || busy} type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /></label><label><T>{"Working together"}</T><textarea disabled={!settingsReady || busy} rows={15} placeholder={t("Section title, then body. Separate sections with a blank line.")} value={settings.terms} onChange={e => setSettings({ ...settings, terms: e.target.value })} /></label><p><T>{"Inquiries are saved in your inbox. Automatic email notifications require a sending service to be connected."}</T></p><button className="solid-button" disabled={!settingsReady || busy} onClick={async () => {
                setBusy(true); try {
                    const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
                    const data = await readResponse(r); setSettings(data); setSavedSettings(JSON.stringify(data)); setMsg('Settings saved.');
                }
                catch (error) {
                    setMsg(error.message);
                } finally { setBusy(false); }
            }}><T>{"Save settings"}</T></button></section>}</main>;
}
