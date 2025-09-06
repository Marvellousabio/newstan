import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
}

async function getAppointment(id: string) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/appointments/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function patchAppointment(id: string, body: any) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  return res;
}

async function deleteAppointmentId(id: string) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/appointments/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  return res;
}

async function updateAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  if (!id) throw new Error('Missing id');
  const body: any = {};
  if (status) body.status = status;
  body.notes = notes;
  const res = await patchAppointment(id, body);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(`Update failed: ${msg}`);
  }
  redirect(`/appointments/${id}`);
}

async function deleteAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '').trim();
  if (!id) throw new Error('Missing id');
  const res = await deleteAppointmentId(id);
  if (!res.ok && res.status !== 204) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(`Delete failed: ${msg}`);
  }
  redirect('/appointments');
}

export default async function AppointmentDetail({ params }: { params: { id: string } }) {
  const appt = await getAppointment(params.id);
  if (!appt) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">Appointment not found.</div>
      </main>
    );
  }

  const a = appt as any;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Appointment {a.id}</h1>
        <a href="/appointments" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Back</a>
      </header>

      <section className="rounded-lg border bg-white p-5 shadow-sm space-y-2">
        <div className="text-sm text-gray-600">Patient</div>
        <div className="font-mono">{a.patientId}</div>
        <div className="text-sm text-gray-600">Clinician</div>
        <div className="font-mono">{a.doctorId || a.clinicianId}</div>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <div className="text-sm text-gray-600">Start</div>
            <div>{a.startAt}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">End</div>
            <div>{a.endAt}</div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <div className="text-sm text-gray-600">Type</div>
            <div>{a.type}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div>
              <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">{a.status}</span>
            </div>
          </div>
        </div>
        <div className="pt-2">
          <div className="text-sm text-gray-600">Notes</div>
          <div className="whitespace-pre-wrap">{a.notes}</div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="font-medium mb-3">Update</h2>
        <form action={updateAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" defaultValue={a.id} />
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select id="status" name="status" defaultValue={a.status} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="canceled">canceled</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
            <input id="notes" name="notes" defaultValue={a.notes || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
            <form action={deleteAction}>
              <input type="hidden" name="id" defaultValue={a.id} />
              <button type="submit" className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50">Delete</button>
            </form>
          </div>
        </form>
      </section>
    </main>
  );
}
