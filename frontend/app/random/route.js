export const dynamic = 'force-dynamic';
import { catalog } from '@/lib/store';
import { redirect } from 'next/navigation';

export async function GET() {
    const projects = await catalog();
    const published = projects.filter(p => p.homepage !== false || p.featured);
    const fallback = published.length > 0 ? published : projects;
    const project = fallback[Math.floor(Math.random() * fallback.length)];
    redirect('/projects/' + project.slug);
}
