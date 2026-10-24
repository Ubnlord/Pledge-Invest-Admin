import { useEffect, useState } from 'react';
import { api } from './lib/platform';

export default function FinancialAdmin({ section }: { section: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const r = await api.get(section === 'Withdrawals' ? '/api/admin/withdrawals' : '/api/admin/plans');
      setItems(r.data.items || []);
    } catch (e: any) {
      setMessage(e?.response?.data?.error || 'Unable to load financial records.');
    }
  };
  useEffect(() => { load(); }, [section]);
  const decide = async (w: any, decision: 'approved' | 'rejected') => {
    const reason = decision === 'approved'
      ? 'Approved for payout; external payout must be completed separately.'
      : window.prompt('Reason for rejecting and releasing funds:') || '';
    if (decision === 'rejected' && !reason.trim()) return;
    if (!w.operation_key) {
      setMessage('This older request has no idempotency key and requires manual review. No funds changed.');
      return;
    }
    if (!window.confirm(decision === 'approved' ? 'Approve for payout? This does not send money.' : 'Reject and release reserved USD once?')) return;
    setBusy(true);
    try {
      await api.post('/api/admin/withdrawals/' + encodeURIComponent(w.user_id) + '/' + encodeURIComponent(w.operation_key) + '/' + decision, { reason });
      setMessage(decision === 'approved' ? 'Approved for payout; no external transfer was sent.' : 'Rejected; reserved funds released.');
      await load();
    } catch (e: any) {
      setMessage(e?.response?.data?.error || 'Unable to process withdrawal.');
    } finally { setBusy(false); }
  };
  const savePlan = async () => {
    if (!editing?.id) return;
    setBusy(true);
    try {
      await api.put('/api/admin/plans/' + encodeURIComponent(editing.id), {
        min_amount: Number(editing.min_amount), max_amount: Number(editing.max_amount),
        advertised_rate: Number(editing.advertised_rate), duration_days: Number(editing.duration_days),
        active: Boolean(editing.active), terms: editing.terms || {}
      });
      setMessage('Plan saved. Existing investments retain their recorded terms.');
      setEditing(null);
      await load();
    } catch (e: any) {
      setMessage(e?.response?.data?.error || 'Unable to save plan.');
    } finally { setBusy(false); }
  };
  if (section === 'Withdrawals') return <section className="mt-5 rounded-2xl border bg-white p-6">
    <h2 className="text-xl font-black">Withdrawal review</h2>
    <p className="mt-2 text-sm text-slate-500">Funds are reserved at request time. Approval does not send money; rejection releases reserved USD once.</p>
    {message && <p className="mt-3 text-sm font-semibold">{message}</p>}
    <div className="mt-5 space-y-3">{items.length === 0 ? <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No withdrawal requests.</div> : items.map((w: any, i: number) =>
      <div key={w.operation_key || w.reference || i} className="rounded-xl border p-4">
        <div className="font-bold">{w.name || w.email || w.user_id}</div>
        <div className="mt-1 break-all text-xs text-slate-500">{w.email} · {w.reference || 'Withdrawal request'}</div>
        <div className="mt-2 font-black">{Number(w.amount || 0).toFixed(2)} USD · {w.status}</div>
        {w.status === 'Pending' && <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => decide(w, 'approved')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Approve for payout</button>
          <button disabled={busy} onClick={() => decide(w, 'rejected')} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">Reject & release</button>
        </div>}
      </div>)}</div>
  </section>;
  return <section className="mt-5 rounded-2xl border bg-white p-6">
    <h2 className="text-xl font-black">Server-configured investment plans</h2>
    <p className="mt-2 text-sm text-slate-500">Updated terms apply to new investments only. Advertised rates are not guaranteed returns.</p>
    {message && <p className="mt-3 text-sm font-semibold">{message}</p>}
    <div className="mt-5 grid gap-3 md:grid-cols-2">{items.map((p: any) =>
      <div key={p.id} className="rounded-xl border p-4">
        <h3 className="font-black">{p.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{Number(p.min).toLocaleString()}–{Number(p.max).toLocaleString()} USD · {p.rate} · {p.term}</p>
        <span className="text-xs font-bold">{p.active ? 'Active' : 'Inactive'}</span>
        <button onClick={() => setEditing({ ...p, min_amount: p.min, max_amount: p.max, advertised_rate: Number(String(p.rate).replace('%', '')), duration_days: Number(String(p.term).match(/\d+/)?.[0] || 30) })} className="mt-3 block rounded-xl border px-4 py-2 text-sm font-bold">Edit plan</button>
      </div>)}</div>
    {editing && <div className="mt-5 rounded-xl border bg-slate-50 p-4">
      <h3 className="font-black">Edit {editing.name}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label>Minimum USD<input type="number" value={editing.min_amount} onChange={e => setEditing((v: any) => ({ ...v, min_amount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label>Maximum USD<input type="number" value={editing.max_amount} onChange={e => setEditing((v: any) => ({ ...v, max_amount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label>Advertised rate (%)<input type="number" min="0" step="0.01" value={editing.advertised_rate} onChange={e => setEditing((v: any) => ({ ...v, advertised_rate: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label>Duration (days)<input type="number" min="1" value={editing.duration_days} onChange={e => setEditing((v: any) => ({ ...v, duration_days: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" checked={Boolean(editing.active)} onChange={e => setEditing((v: any) => ({ ...v, active: e.target.checked }))} />Active for new investments</label>
      </div>
      <div className="mt-4 flex gap-2"><button disabled={busy} onClick={savePlan} className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white disabled:opacity-50">Save plan</button><button onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 font-bold">Cancel</button></div>
    </div>}
  </section>;
}
