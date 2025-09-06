import Link from "next/link";
import AppointmentsClient from "@/components/dashboard/AppointmentsClient";
export const dynamic = 'force-dynamic';

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
}

export default async function AppointmentsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q: Record<string, string> = {};
  if (typeof searchParams?.status === 'string' && searchParams.status.trim()) q.status = searchParams.status.trim();
  if (typeof searchParams?.doctorId === 'string' && searchParams.doctorId.trim()) q.doctorId = searchParams.doctorId.trim();
  if (typeof searchParams?.patientId === 'string' && searchParams.patientId.trim()) q.patientId = searchParams.patientId.trim();
  if (typeof searchParams?.from === 'string' && searchParams.from.trim()) q.from = searchParams.from.trim();
  if (typeof searchParams?.to === 'string' && searchParams.to.trim()) q.to = searchParams.to.trim();
  q.limit = (typeof searchParams?.limit === 'string' && searchParams.limit.trim()) ? searchParams.limit.trim() : '50';

  const items: any[] = [];

  return (
    <main className="px-6 md:px-10">
      <section className="mx-auto max-w-6xl py-6 md:py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Appointments</h1>
              <p className="text-gray-600 mt-1">Schedule and manage patient appointments</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={{ pathname: '/api/appointments/export', query: q }} className="btn btn-muted">Export CSV</Link>
              <Link href="/appointments/new" className="btn btn-primary">New appointment</Link>
            </div>
          </div>
        </div>

        <AppointmentsClient />

        <section className="card bg-white/90 p-4 backdrop-blur mb-6">
          <form className="grid gap-3 md:grid-cols-6" method="get">
            <div className="md:col-span-1">
              <label htmlFor="status" className="block text-xs font-medium mb-1">Status</label>
              <select id="status" name="status" defaultValue={typeof searchParams?.status === 'string' ? searchParams.status : ''} className="w-full rounded border px-2 py-1 text-sm">
                <option value="">Any</option>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="completed">completed</option>
                <option value="canceled">canceled</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label htmlFor="doctorId" className="block text-xs font-medium mb-1">Clinician</label>
              <input id="doctorId" name="doctorId" defaultValue={typeof searchParams?.doctorId === 'string' ? searchParams.doctorId : ''} className="w-full rounded border px-2 py-1 text-sm" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="patientId" className="block text-xs font-medium mb-1">Patient</label>
              <input id="patientId" name="patientId" defaultValue={typeof searchParams?.patientId === 'string' ? searchParams.patientId : ''} className="w-full rounded border px-2 py-1 text-sm" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="from" className="block text-xs font-medium mb-1">From (ISO)</label>
              <input id="from" name="from" defaultValue={typeof searchParams?.from === 'string' ? searchParams.from : ''} className="w-full rounded border px-2 py-1 text-sm" placeholder="2025-09-01T00:00:00.000Z" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="to" className="block text-xs font-medium mb-1">To (ISO)</label>
              <input id="to" name="to" defaultValue={typeof searchParams?.to === 'string' ? searchParams.to : ''} className="w-full rounded border px-2 py-1 text-sm" placeholder="2025-09-30T23:59:59.999Z" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="limit" className="block text-xs font-medium mb-1">Limit</label>
              <input id="limit" name="limit" type="number" min={1} max={200} defaultValue={typeof searchParams?.limit === 'string' ? searchParams.limit : '50'} className="w-full rounded border px-2 py-1 text-sm" />
            </div>
            <div className="md:col-span-6 flex items-center gap-3 pt-1">
              <button type="submit" className="btn btn-primary">Apply</button>
              <Link href="/appointments" className="text-sm underline">Reset</Link>
            </div>
          </form>
        </section>

        <section className="card bg-white/90 backdrop-blur overflow-x-auto">
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
              {items.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-gray-500" colSpan={7}>
                    No appointments yet.
                  </td>
                </tr>
              ) : (
                items.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="px-5 py-2 font-mono text-blue-700 underline">
                      <Link href={`/appointments/${r.id}`}>{r.id}</Link>
                    </td>
                    <td className="px-5 py-2">{r.patientId}</td>
                    <td className="px-5 py-2">{r.doctorId || r.clinicianId}</td>
                    <td className="px-5 py-2 whitespace-nowrap">{r.startAt}</td>
                    <td className="px-5 py-2 whitespace-nowrap">{r.endAt}</td>
                    <td className="px-5 py-2">{r.type}</td>
                    <td className="px-5 py-2">
                      <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">{r.status}</span>
                    </td>
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
