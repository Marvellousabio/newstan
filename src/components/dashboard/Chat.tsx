"use client";

import React, { useEffect, useRef, useState } from "react";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

export default function Chat({ threadId, initialMessages }: { threadId: string; initialMessages: any[] }) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let socket: any;
    (async () => {
      try {
        const io = (await import("socket.io-client")).io;
        socket = io(getApiBase(), { withCredentials: true });
        socket.emit("thread:join", threadId);
        socket.on("message:new", (msg: any) => {
          if (msg?.threadId === threadId) {
            setMessages((prev) => [...prev, msg]);
          }
        });
        setReady(true);
      } catch {
        setReady(false);
      }
    })();
    return () => { try { socket && socket.disconnect(); } catch {} };
  }, [threadId]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    const base = getApiBase();
    const res = await fetch(`${base}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ threadId, text: t }),
    });
    if (!res.ok) {
      // Revert input and notify
      setText(t);
      alert(`Send failed: ${res.status}`);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="mb-4 max-h-[50vh] overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id || Math.random()} className="flex flex-col">
            <div className="text-xs text-gray-500">{m.senderId}</div>
            <div className="inline-block rounded bg-gray-100 px-3 py-2 text-sm">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={ready ? "Type a message" : "Connecting..."}
          className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button disabled={!ready} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          Send
        </button>
      </form>
    </div>
  );
}
