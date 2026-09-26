import { T } from '@/components/preferences';
import { notFound } from 'next/navigation';
import Link from '@/components/site-link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Image from 'next/image';
import { StackGallery } from '@/components/stack-gallery';
import { DesktopGallery } from '@/components/desktop-gallery';
import { VandalismCanvas } from '@/components/vandalism-canvas';
import { catalog } from '@/lib/store';

export const revalidate = 3600;

export default async function Project({ params }) {
    const { slug } = await params;

    // We fetch EVERYTHING so we don't rely on standard APIs on the old render server
    const all = await catalog();
    const p = all.find(item => item.slug === slug);
    if (!p) notFound();

    return (
        <main>
            <SiteHeader />
            <section className="page-heading">
                <Link className="eyebrow" href="/projects"><T>{"← All projects"}</T></Link>
                <h1 className="project-title">{p.title}</h1>
                <div className="case-tags">
                    <span><T>{p.country}</T></span>
                    <span>{p.brand}</span>
                    <span>{p.year}</span>
                    <span><T>{p.status}</T></span>
                </div>
            </section>

            {/* Desktop Space-Conscious 3D Carousel */}
            <div className="case-gallery desktop-only-gallery">
                <DesktopGallery images={p.images} title={p.title} />
            </div>

            {/* Mobile Tinder Stack */}
            <div className="case-gallery mobile-only-gallery">
                <StackGallery images={p.images} title={p.title} />
            </div>

            <section className="case-description">
                <p className="eyebrow"><T>{"Design / Kerem Can Kuru"}</T></p>
                <div>
                    <p><T>{p.description}</T></p>
                    {p.status === 'Concept' && <small><T>{"Independent concept. Not an official collaboration or endorsement by the featured clubs or brands."}</T></small>}
                </div>
            </section>

            <section className="closing">
                <p><T>{"Have something in mind?"}</T></p>
                <Link href="/contact"><T>{"Start a project ↗"}</T></Link>
            </section>
            <VandalismCanvas />
            <SiteFooter />
        </main>
    );
}

export async function generateStaticParams() {
    const items = await catalog();
    return items.map((p) => ({
        slug: p.slug,
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const all = await catalog();
    const p = all.find(item => item.slug === slug);
    if (!p) return { title: "Project not found — KRM Design" };

    return {
        title: p.title + " — KRM Design",
        description: p.description?.slice(0, 160) || '',
        openGraph: {
            title: p.title + " — KRM Design",
            description: p.description?.slice(0, 160) || '',
            images: [
                {
                    url: p.images[0],
                }
            ],
            type: 'article',
        }
    };
}
