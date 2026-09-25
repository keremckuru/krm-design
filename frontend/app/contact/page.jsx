import { T } from '@/components/preferences';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { InquiryForm } from '@/components/inquiry-form';
import { siteSettings } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default async function Contact() { let email = ''; try {
    email = (await siteSettings()).email || '';
}
catch { } return <main><SiteHeader /><section className="page-heading"><p className="eyebrow"><T>{"New commissions / Worldwide"}</T></p><h1><T>{"Let’s"}</T> <em><T>{"talk."}</T></em></h1></section><section className="contact-layout section-wrap"><div><h2><T>{"A good project"}</T><br /><T>{"starts with a conversation."}</T></h2><p><T>{"Tell me what you’re imagining. Share your scope, timeline and budget, or ask for a tailored quote."}</T></p>{email && <a href={'mailto:' + email}>{email} ↗</a>}<p><a href="/info"><T>{"How we work together ↗"}</T></a></p></div><InquiryForm /></section><SiteFooter /></main>; }
