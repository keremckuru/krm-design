import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/store';
import { AdminPanel } from '@/components/admin-panel';
import './admin.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Studio administration — KRM Design', robots: { index: false, follow: false } };
export default async function Admin() { if (!await isAdmin()) redirect('/admin/login'); return <AdminPanel />; }
