import { T } from '@/components/preferences';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Archive } from '@/components/archive';
import { catalog } from '@/lib/store';
export default async function Projects({ searchParams }) {
    const { team } = await searchParams; let p; try {
        p = await catalog();
    }
        catch {
            return <main><SiteHeader /><section className="section-wrap"><h1><T>{"Archive temporarily unavailable"}</T></h1><p><T>{"Please refresh in a moment."}</T></p></section><SiteFooter /></main>;
        } return <main><SiteHeader /><section className="page-heading"><p className="eyebrow"><T>{"The independent football archive"}</T></p><h1><T>{"Selected"}</T> <em><T>{"work."}</T></em></h1></section><section className="section-wrap archive-section"><Archive projects={p} team={team} /></section><SiteFooter /></main>;
}
