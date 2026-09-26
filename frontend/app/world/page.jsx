import { T } from '@/components/preferences';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WorldIndex } from '@/components/world-index';
import { catalog, sliceForClient } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default async function World() { const projects = sliceForClient(await catalog()); return <main className="world-page"><SiteHeader /><a href="/random" title="Random Project" className="floating-random-bttn">🎲</a><section className="page-heading"><p className="eyebrow"><T>{"Explore by geography"}</T></p><h1><T>{"World"}</T> <em><T>{"index."}</T></em></h1></section><WorldIndex projects={projects} /><SiteFooter /></main>; }
