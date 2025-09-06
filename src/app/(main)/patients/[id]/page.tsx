import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
}

async function getPatient(id: string) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/patients/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function patchPatient(id: string, body: any) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/patients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  return res;
}

async function deletePatientId(id: string) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/patients/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  return res;
}

async function updateAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '').trim();
  if (!id) throw new Error('Missing id');
  const name = String((formData.get('name') || '').toString().trim());
  const email = String((formData.get('email') || '').toString().trim());
  const phone = String((formData.get('phone') || '').toString().trim());
  const dob = String((formData.get('dob') || '').toString().trim());
  const gender = String((formData.get('gender') || '').toString().trim());
  const notes = String((formData.get('notes') || '').toString().trim());
  const body: any = {};
  if (name) body.name = name;
  body.email = email;
  body.phone = phone;
  body.dob = dob;
  body.gender = gender;
  body.notes = notes;

  const res = await patchPatient(id, body);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(`Update failed: ${msg}`);
  }
  redirect(`/patients/${id}`);
}

async function deleteAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '').trim();
  if (!id) throw new Error('Missing id');
  const res = await deletePatientId(id);
  if (!res.ok && res.status !== 204) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(`Delete failed: ${msg}`);
  }
  redirect('/patients');
}

export default async function PatientDetail({ params }: { params: { id: string } }) {
  const patient = await getPatient(params.id);
  if (!patient) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">Patient not found.</div>
      </main>
    );
  }

  const p = patient as any;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Patient {p.id}</h1>
        <a href="/patients" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Back</a>
      </header>

      <section className="rounded-lg border bg-white p-5 shadow-sm space-y-2">
        <div className="text-sm text-gray-600">Name</div>
        <div className="font-medium">{p.name}</div>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <div className="text-sm text-gray-600">Email</div>
            <div className="break-all">{p.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Phone</div>
            <div>{p.phone}</div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <div className="text-sm text-gray-600">Date of Birth</div>
            <div>{p.dob}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Gender</div>
            <div>{p.gender}</div>
          </div>
        </div>
        <div className="pt-2">
          <div className="text-sm text-gray-600">Notes</div>
          <div className="whitespace-pre-wrap">{p.notes}</div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="font-medium mb-3">Update</h2>
        <form action={updateAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" defaultValue={p.id} />
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input id="name" name="name" defaultValue={p.name || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" defaultValue={p.email || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
            <input id="phone" name="phone" defaultValue={p.phone || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium mb-1">Date of Birth</label>
            <input id="dob" name="dob" defaultValue={p.dob || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
            <input id="gender" name="gender" defaultValue={p.gender || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
            <input id="notes" name="notes" defaultValue={p.notes || ''} className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
            <form action={deleteAction}>
              <input type="hidden" name="id" defaultValue={p.id} />
              <button type="submit" className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50">Delete</button>
            </form>
          </div>
        </form>
      </section>
    </main>
  );
}
