import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

async function createPatient(formData: FormData) {
  'use server';
  const name = String(formData.get('name') || '').trim();
  const email = String((formData.get('email') || '').toString().trim());
  const phone = String((formData.get('phone') || '').toString().trim());
  const dob = String((formData.get('dob') || '').toString().trim());
  const gender = String((formData.get('gender') || '').toString().trim());
  const notes = String((formData.get('notes') || '').toString().trim());

  if (!name) {
    throw new Error('Name is required');
  }

  const base = getApiBase();
  const res = await fetch(`${base}/api/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, dob, gender, notes }),
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(`Create failed: ${msg}`);
  }

  redirect('/patients');
}

export default function NewPatientPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">New Patient</h1>
      </header>

      <form action={createPatient} className="rounded-lg border bg-white p-5 shadow-sm space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" name="name" required className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="jane@example.com" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
            <input id="phone" name="phone" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1234567890" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dob" className="block text-sm font-medium mb-1">Date of Birth</label>
            <input id="dob" name="dob" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1990-01-31" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
            <input id="gender" name="gender" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="female/male/other" />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
          <input id="notes" name="notes" className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create</button>
          <a href="/patients" className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</a>
        </div>
      </form>

      <p className="text-xs text-gray-500">This form posts to {getApiBase()}/api/patients.</p>
    </main>
  );
}
