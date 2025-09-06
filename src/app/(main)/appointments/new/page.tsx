import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

async function createAppointment(formData: FormData) {
  'use server';
  const patientId = String(formData.get('patientId') || '').trim();
  const doctorId = String(formData.get('doctorId') || '').trim();
  const startAt = String(formData.get('startAt') || '').trim();
  const endAt = String(formData.get('endAt') || '').trim();
  const type = String(formData.get('type') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  if (!patientId || !doctorId || !startAt || !endAt || !type) {
    throw new Error('Missing required fields');
  }

  const base = getApiBase();
  const res = await fetch(`${base}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, doctorId, startAt, endAt, type, notes }),
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(`Create failed: ${msg}`);
  }

  redirect('/appointments');
}

export default function NewAppointmentPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">New Appointment</h1>
      </header>

      <form action={createAppointment} className="rounded-lg border bg-white p-5 shadow-sm space-y-4">
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium mb-1">Patient ID</label>
          <input id="patientId" name="patientId" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="pat_123" />
        </div>
        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium mb-1">Clinician/Doctor ID</label>
          <input id="doctorId" name="doctorId" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="doc_456" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startAt" className="block text-sm font-medium mb-1">Start (ISO)</label>
            <input id="startAt" name="startAt" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2025-09-05T10:00:00.000Z" />
          </div>
          <div>
            <label htmlFor="endAt" className="block text-sm font-medium mb-1">End (ISO)</label>
            <input id="endAt" name="endAt" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2025-09-05T10:30:00.000Z" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
            <input id="type" name="type" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Consultation" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
            <input id="notes" name="notes" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create</button>
          <a href="/appointments" className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</a>
        </div>
      </form>

      <p className="text-xs text-gray-500">Times must be ISO-8601 UTC (e.g., 2025-09-05T10:00:00.000Z). This form posts to {getApiBase()}/api/appointments.</p>
    </main>
  );
}
