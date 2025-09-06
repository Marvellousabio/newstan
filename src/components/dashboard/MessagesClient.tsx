"use client";

import React, { useEffect, useState } from "react";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

export default function MessagesClient() {
  const [data, setData] = useState<any>({ items: [], error: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/threads?limit=50`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setData({ items: [], error: `Backend unavailable (${res.status}). Start the server with: cd server && npm run dev` });
          return;
        }
        const json = await res.json();
        if (!cancelled) setData({ items: json.items || [], error: null });
      } catch (e: any) {
        if (!cancelled) setData({ items: [], error: `Backend unavailable. Start the server with: cd server && npm run dev` });
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800">Backend Server Not Running</h3>
              <p className="mt-1 text-sm text-amber-700">{data.error}</p>
              <div className="mt-2">
                <p className="text-xs text-amber-600">To fix this:</p>
                <ol className="mt-1 text-xs text-amber-600 list-decimal list-inside space-y-1">
                  <li>Open a new terminal</li>
                  <li>Run: <code className="bg-amber-100 px-1 rounded">cd server && npm run dev</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="rounded-lg border bg-white shadow-sm overflow-x-auto fade-up">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-2 text-left font-medium">Thread ID</th>
              <th className="px-5 py-2 text-left font-medium">Members</th>
              <th className="px-5 py-2 text-left font-medium">Last message</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-gray-500" colSpan={3}>No threads yet.</td>
              </tr>
            ) : (
              data.items.map((t: any, idx: number) => (
                <tr key={t.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-5 py-2 font-mono text-blue-700 underline"><a href={`/messages/${t.id}`}>{t.id}</a></td>
                  <td className="px-5 py-2">{Array.isArray(t.memberIds) ? t.memberIds.join(", ") : ''}</td>
                  <td className="px-5 py-2 whitespace-nowrap">{t.lastMessageAt ? String(t.lastMessageAt) : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
