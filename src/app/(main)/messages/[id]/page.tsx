"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Chat from "@/components/dashboard/Chat";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

export default function ThreadPage({ params }: { params: { id: string } }) {
  const threadId = params.id;
  const [initialMessages, setInitialMessages] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/messages?threadId=${encodeURIComponent(threadId)}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setError(`HTTP ${res.status}`);
          return;
        }
        const json = await res.json();
        if (!cancelled) setInitialMessages(json.items || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "load failed");
      }
    })();
    return () => { cancelled = true; };
  }, [threadId]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="fade-up">
        <div className="rounded-xl bg-[color:var(--bg-muted)] p-6 md:p-8 border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Thread {threadId}</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time secure conversation</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/messages" className="btn btn-muted">All threads</Link>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="card p-3 text-sm text-red-700 border-red-200 bg-red-50">Failed to load: {error}</div>
      )}

      {initialMessages === null ? (
        <div className="card p-6 skeleton">Loading messages…</div>
      ) : (
        <Chat threadId={threadId} initialMessages={initialMessages} />
      )}
    </main>
  );
}
