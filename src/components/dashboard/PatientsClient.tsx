"use client";

import React, { useEffect, useState } from "react";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

export default function PatientsClient() {
  const [data, setData] = useState<any>({ items: [], error: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/patients?limit=50`, {
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
  }, []);

  return (
    <>
      {loading && <div className="card p-3 skeleton">Loading…</div>}
      {data.error && (
        <div className="card p-3 text-sm text-red-700 border-red-200 bg-red-50">Failed to load: {data.error}</div>
      )}
      <section className="rounded-lg border bg-white shadow-sm overflow-x-auto fade-up">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-2 text-left font-medium">ID</th>
              <th className="px-5 py-2 text-left font-medium">Name</th>
              <th className="px-5 py-2 text-left font-medium">Email</th>
              <th className="px-5 py-2 text-left font-medium">Phone</th>
              <th className="px-5 py-2 text-left font-medium">DOB</th>
              <th className="px-5 py-2 text-left font-medium">Gender</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-gray-500" colSpan={6}>
                  No patients yet.
                </td>
              </tr>
            ) : (
              data.items.map((r: any, idx: number) => (
                <tr key={r.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-5 py-2 font-mono text-blue-700 underline">
                    <a href={`/patients/${r.id}`}>{r.id}</a>
                  </td>
                  <td className="px-5 py-2">{r.name}</td>
                  <td className="px-5 py-2">{r.email}</td>
                  <td className="px-5 py-2">{r.phone}</td>
                  <td className="px-5 py-2 whitespace-nowrap">{r.dob}</td>
                  <td className="px-5 py-2">{r.gender}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
