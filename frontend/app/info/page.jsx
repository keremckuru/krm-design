import { T } from '@/components/preferences';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { siteSettings } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default async function Info() { let terms = ''; try {
    terms = (await siteSettings()).terms || '';
}
catch { } return <main><SiteHeader /><section className="page-heading"><p className="eyebrow"><T>{"Process / Scope / Delivery"}</T></p><h1><T>{"Working"}</T> <em><T>{"together."}</T></em></h1></section><section className="info-list section-wrap">{(terms ? terms.split('\n\n') : ['01 / The brief\nWe define the audience, concept, deliverables and timeline before the work begins.', '02 / Creative direction\nResearch and visual direction establish the foundation of the design.', '03 / Revisions\nThe number of revision rounds is agreed in your project proposal. Additional work is scoped separately before it starts.', '04 / Delivery\nFinal file formats, production assets and usage rights are defined in the agreed scope.', '05 / Payment & scheduling\nPayment stages, booking and delivery dates are confirmed in the individual proposal.', '06 / Concept archive\nSelf-initiated concepts are shown alongside commissioned work. Project labels identify the distinction.']).map((item, i) => { const [title, ...body] = item.split('\n'); return <article key={i}><h2><T>{title}</T></h2><p><T>{body.join('\n')}</T></p></article>; })}</section><SiteFooter /></main>; }
