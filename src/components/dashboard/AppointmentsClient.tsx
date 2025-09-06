"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

export default function AppointmentsClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<any>({ items: [], error: null });
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const q: Record<string, string> = {};
    const keys = ["status","doctorId","patientId","from","to","limit"];
    keys.forEach((k) => {
      const v = search.get(k);
      if (v) q[k] = v;
    });
    if (!q.limit) q.limit = "50";
    return q;
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const base = getApiBase();
        const params = new URLSearchParams(query);
        const res = await fetch(`${base}/api/appointments?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setData({ items: [], error: `HTTP ${res.status}` });
          return;
        }
        const json = await res.json();
        if (!cancelled) setData({ items: json.items || [], error: null });
      } catch (e: any) {
        if (!cancelled) setData({ items: [], error: e?.message || "load failed" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  const onReset = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(pathname);
  };

  return (
    <>
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-6" method="get">
          <div className="md:col-span-1">
            <label htmlFor="status" className="block text-xs font-medium mb-1">Status</label>
            <select id="status" name="status" defaultValue={search.get("status") || ""} className="w-full rounded border px-2 py-1 text-sm">
              <option value="">Any</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="canceled">canceled</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="doctorId" className="block text-xs font-medium mb-1">Clinician</label>
            <input id="doctorId" name="doctorId" defaultValue={search.get("doctorId") || ""} className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="patientId" className="block text-xs font-medium mb-1">Patient</label>
            <input id="patientId" name="patientId" defaultValue={search.get("patientId") || ""} className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="from" className="block text-xs font-medium mb-1">From (ISO)</label>
            <input id="from" name="from" defaultValue={search.get("from") || ""} className="w-full rounded border px-2 py-1 text-sm" placeholder="2025-09-01T00:00:00.000Z" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="to" className="block text-xs font-medium mb-1">To (ISO)</label>
            <input id="to" name="to" defaultValue={search.get("to") || ""} className="w-full rounded border px-2 py-1 text-sm" placeholder="2025-09-30T23:59:59.999Z" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="limit" className="block text-xs font-medium mb-1">Limit</label>
            <input id="limit" name="limit" type="number" min={1} max={200} defaultValue={search.get("limit") || "50"} className="w-full rounded border px-2 py-1 text-sm" />
          </div>
          <div className="md:col-span-6 flex items-center gap-3 pt-1">
            <button type="submit" className="btn btn-primary">Apply</button>
            <a href="#" onClick={onReset} className="text-sm underline">Reset</a>
          </div>
        </form>
      </section>

      {loading && (
        <div className="card p-3 skeleton">Loading…</div>
      )}

      {data.error && (
        <div className="card p-3 text-sm text-red-700 border-red-200 bg-red-50">Failed to load: {data.error}</div>
      )}

      <section className="rounded-lg border bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-2 text-left font-medium">ID</th>
              <th className="px-5 py-2 text-left font-medium">Patient</th>
              <th className="px-5 py-2 text-left font-medium">Clinician</th>
              <th className="px-5 py-2 text-left font-medium">Start</th>
              <th className="px-5 py-2 text-left font-medium">End</th>
              <th className="px-5 py-2 text-left font-medium">Type</th>
              <th className="px-5 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-gray-500" colSpan={7}>
                  No appointments yet.
                </td>
              </tr>
            ) : (
              data.items.map((r: any, idx: number) => (
                <tr key={r.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-5 py-2 font-mono text-blue-700 underline">
                    <a href={`/appointments/${r.id}`}>{r.id}</a>
                  </td>
                  <td className="px-5 py-2">{r.patientId}</td>
                  <td className="px-5 py-2">{r.doctorId || r.clinicianId}</td>
                  <td className="px-5 py-2 whitespace-nowrap">{r.startAt}</td>
                  <td className="px-5 py-2 whitespace-nowrap">{r.endAt}</td>
                  <td className="px-5 py-2">{r.type}</td>
                  <td className="px-5 py-2">
                    <span className="badge" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>{r.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
