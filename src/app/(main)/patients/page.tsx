import Link from "next/link";
import PatientsClient from "@/components/dashboard/PatientsClient";
export const dynamic = 'force-dynamic';

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
}

async function getPatients() {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/patients?limit=50`, { cache: 'no-store' });
    if (!res.ok) {
      return { items: [], error: `Backend unavailable (${res.status})` };
    }
    return res.json();
  } catch (err) {
    return { items: [], error: 'Backend unavailable' };
  }
}

export default async function PatientsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const data = await getPatients();
  const items: any[] = data.items || [];
  const name = typeof searchParams?.name === 'string' ? searchParams.name.trim().toLowerCase() : '';
  const filtered = name
    ? items.filter((r: any) => String(r.name || '').toLowerCase().includes(name))
    : items;

  return (
    <main className="px-6 md:px-10">
      <section className="mx-auto max-w-6xl py-6 md:py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Patients</h1>
              <p className="text-gray-600 mt-1">Manage patient records and medical information</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={{ pathname: '/api/patients/export' }} className="btn btn-muted">Export CSV</Link>
              <Link href="/patients/new" className="btn btn-primary">New patient</Link>
            </div>
          </div>
        </div>

        {data.error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
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

        <section className="card bg-white/90 p-4 backdrop-blur mb-6">
          <form className="grid gap-3 md:grid-cols-6" method="get">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-xs font-medium mb-1">Filter by name</label>
              <input id="name" name="name" defaultValue={typeof searchParams?.name === 'string' ? searchParams.name : ''} className="w-full rounded border px-2 py-1 text-sm" placeholder="e.g., Jane" />
            </div>
            <div className="md:col-span-6 flex items-center gap-3 pt-1">
              <button type="submit" className="btn btn-primary">Apply</button>
              <Link href="/patients" className="text-sm underline">Reset</Link>
            </div>
          </form>
        </section>

        <PatientsClient />

        <section className="card bg-white/90 backdrop-blur overflow-x-auto">
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
              {(filtered.length === 0) ? (
                <tr>
                  <td className="px-5 py-6 text-center text-gray-500" colSpan={6}>
                    No patients yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="px-5 py-2 font-mono text-blue-700 underline">
                      <Link href={`/patients/${r.id}`}>{r.id}</Link>
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
      </section>
    </main>
  );
}
