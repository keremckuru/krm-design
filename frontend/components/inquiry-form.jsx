'use client';
import { T, usePreferences } from '@/components/preferences';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function InquiryForm() {
    const { t } = usePreferences();
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);
    const [date, setDate] = useState();

    return <form className="inquiry-form" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setStatus(''); const form = e.currentTarget; try {
            const data = Object.fromEntries(new FormData(form));
            const r = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!r.ok)
                throw new Error();
            setStatus('Your inquiry has been received. Thank you — we’ll review your brief.');
            form.reset();
        }
        catch {
            setStatus('Unable to send right now. Your details are still here; please try again.');
        }
        finally {
        }
    }}><label><T>{"Your name"}</T><input name="name" required minLength={2} maxLength={120} /></label><label><T>{"Email"}</T><input name="email" type="email" required /></label><label><T>{"Club / company"}</T><input name="company" maxLength={150} /></label><label><T>{"What do you need?"}</T><Select name="service" required><SelectTrigger className="w-full"><SelectValue placeholder={t("Select service")} /></SelectTrigger><SelectContent><SelectItem value="Kit design"><T>{"Kit design"}</T></SelectItem><SelectItem value="Merchandise design"><T>{"Merchandise design"}</T></SelectItem><SelectItem value="Art direction / campaign"><T>{"Art direction / campaign"}</T></SelectItem><SelectItem value="Visual identity"><T>{"Visual identity"}</T></SelectItem><SelectItem value="Something else"><T>{"Something else"}</T></SelectItem></SelectContent></Select></label><label><T>{"Budget"}</T><Select name="budget" required><SelectTrigger className="w-full"><SelectValue placeholder={t("Select a range")} /></SelectTrigger><SelectContent><SelectItem value="Under €500"><T>{"Under €500"}</T></SelectItem><SelectItem value="€500–€1,500">€500–€1,500</SelectItem><SelectItem value="€1,500–€5,000">€1,500–€5,000</SelectItem><SelectItem value="€5,000+">€5,000+</SelectItem><SelectItem value="I would like a quote"><T>{"I would like a quote"}</T></SelectItem></SelectContent></Select></label><label><T>{"Preferred deadline"}</T><input type="hidden" name="deadline" value={date ? format(date, 'yyyy-MM-dd') : ''} /><Popover><PopoverTrigger asChild><button type="button" className={`font-normal ${!date ? 'text-muted-foreground' : ''}`} style={{ width: '100%', justifyContent: 'space-between', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CalendarIcon className="size-4 opacity-50" />{date ? format(date, "PPP") : <span>{t("Pick a date")}</span>}</div></button></PopoverTrigger><PopoverContent className="w-auto p-0 border-[var(--line)] bg-[var(--paper)]" align="start"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></label><label className="wide"><T>{"Tell me about the project"}</T><textarea name="message" required minLength={20} maxLength={8000} rows={5} placeholder={t("The idea, the audience, the deliverables. Reference links are welcome.")} /></label><label className="honeypot" aria-hidden="true"><T>{"Website"}</T><input name="website" tabIndex={-1} autoComplete="off" /></label><p className="wide small-note"><T>{"Your details are used only to review and respond to this inquiry."}</T></p><button className="solid-button wide" disabled={busy}>{t(busy ? 'Sending…' : 'Send project inquiry ')} <span className="arrow-icon">↗</span></button><p role="status" className="wide">{t(status)}</p></form>;
}
