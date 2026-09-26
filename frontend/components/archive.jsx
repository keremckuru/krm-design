'use client';
import { T, usePreferences } from '@/components/preferences';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from '@/components/site-link';
import { Gallery } from './gallery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function ProjectCards({ projects, groupByCountry = false }) {
    const { t } = usePreferences();
    if (groupByCountry) {
        const groups = {};
        for (const p of projects) {
            if (!groups[p.country]) groups[p.country] = [];
            groups[p.country].push(p);
        }
        return <div className="portfolio-grid">
            {Object.entries(groups).map(([c, proj]) => (
                <div key={c} style={{ gridColumn: '1 / -1' }}>
                    <h3 className="country-group-heading"><T>{c}</T></h3>
                    <div className="portfolio-grid">
                        {proj.map(p => <article className="portfolio-card" key={p.slug}><Gallery images={p.images} title={p.title} compact href={'/projects/' + p.slug} /><Link href={'/projects/' + p.slug} className="card-caption"><span className="eyebrow"><T>{p.country}</T> / <T>{p.status}</T> ↗</span><h2>{p.title}</h2><span className="eyebrow"><T>{p.kind}</T> · {p.year}</span></Link></article>)}
                    </div>
                </div>
            ))}
        </div>;
    }
    return <div className="portfolio-grid">{projects.map(p => <article className="portfolio-card" key={p.slug}><Gallery images={p.images} title={p.title} compact href={'/projects/' + p.slug} /><Link href={'/projects/' + p.slug} className="card-caption"><span className="eyebrow"><T>{p.country}</T> / <T>{p.status}</T> ↗</span><h2>{p.title}</h2><span className="eyebrow"><T>{p.kind}</T> · {p.year}</span></Link></article>)}</div>;
}
export function Archive({ projects, team = '' }) {
    const { t } = usePreferences();
    const params = useSearchParams();
    const [q, setQ] = useState(params.get('q') || team);
    const [kind, setKind] = useState(params.get('kind') || 'All');
    const [country, setCountry] = useState(params.get('country') || 'All countries');
    const [sort, setSort] = useState(params.get('sort') || 'default');

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('team');
        for (const [key, value, empty] of [['q', q, ''], ['kind', kind, 'All'], ['country', country, 'All countries'], ['sort', sort, 'default']]) {
            if (value !== empty) url.searchParams.set(key, value);
            else url.searchParams.delete(key);
        }
        window.history.replaceState(null, '', url);
    }, [q, kind, country, sort]);

    let shown = projects.filter(p => (kind === 'All' || p.kind === kind) && (country === 'All countries' || p.country === country) && (p.title + ' ' + p.team + ' ' + p.brand + ' ' + p.country).toLowerCase().includes(q.toLowerCase()));

    if (sort === 'a-z') shown.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'z-a') shown.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'newest') shown.sort((a, b) => b.year - a.year);
    else if (sort === 'country') shown.sort((a, b) => a.country.localeCompare(b.country) || b.year - a.year);

    return <>
        <div className="filter-bar">
            <input aria-label={t("Search projects")} placeholder={t("Search team, project, brand…")} value={q} onChange={e => setQ(e.target.value)} />
            <div className="filter-tabs">
                {['All', 'Club', 'National'].map(k => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{t(k)}</button>)}
            </div>
            <Select value={country} onValueChange={setCountry}>
                <SelectTrigger aria-label={t("Filter by country")}><SelectValue placeholder={t("All countries")} /></SelectTrigger>
                <SelectContent>
                    {['All countries', ...new Set(projects.map(p => p.country))].map(c => <SelectItem key={c} value={c}>{t(c)}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
                <SelectTrigger aria-label={t("Sort projects")}><SelectValue placeholder={t("Default sorting")} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="default"><T>{"Default sorting"}</T></SelectItem>
                    <SelectItem value="country"><T>{"Group by country"}</T></SelectItem>
                    <SelectItem value="newest"><T>{"Newest first"}</T></SelectItem>
                    <SelectItem value="a-z"><T>{"A to Z"}</T></SelectItem>
                    <SelectItem value="z-a"><T>{"Z to A"}</T></SelectItem>
                </SelectContent>
            </Select>
            {(q !== team || kind !== 'All' || country !== 'All countries' || sort !== 'default') && <button className="clear-filters" onClick={() => { setQ(''); setKind('All'); setCountry('All countries'); setSort('default'); }}><T>{"Clear filters ✕"}</T></button>}
        </div>
        {shown.length ? <ProjectCards projects={shown} groupByCountry={sort === 'country'} /> : <div className="empty-state"><T>{"No projects match these filters."}</T></div>}
    </>;
}
