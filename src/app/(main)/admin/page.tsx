import Link from "next/link";

export const dynamic = "force-dynamic";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

async function fetchJSON(path: string) {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, { cache: "no-store", credentials: "include" });
  if (!res.ok) {
    return { error: `HTTP ${res.status}`, items: [] } as any;
  }
  return res.json();
}

export default async function AdminPage() {
  const [appointments, patients] = await Promise.all([
    fetchJSON(`/api/appointments?limit=200`),
    fetchJSON(`/api/patients?limit=200`),
  ]);

  const apptItems: any[] = appointments.items || [];
  const patientItems: any[] = patients.items || [];

  const totals = {
    appointments: apptItems.length,
    patients: patientItems.length,
    confirmed: apptItems.filter((a) => a.status === "confirmed").length,
    pending: apptItems.filter((a) => a.status === "pending").length,
  };

  const series = [
    { label: "Patients", value: totals.patients, color: "var(--accent-blue)" },
    { label: "Appointments", value: totals.appointments, color: "var(--accent-green)" },
    { label: "Confirmed", value: totals.confirmed, color: "var(--accent-green)" },
    { label: "Pending", value: totals.pending, color: "var(--warn-amber)" },
  ];

  const maxValue = Math.max(...series.map((s) => s.value), 1);

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <header className="flex items-center justify-between fade-up">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Admin Analytics</h1>
        <div className="flex items-center gap-2">
          <Link href={{ pathname: '/api/appointments/export' }} className="btn btn-muted">Export Appointments CSV</Link>
          <Link href={{ pathname: '/api/patients/export' }} className="btn btn-muted">Export Patients CSV</Link>
        </div>
      </header>

      {(appointments.error || patients.error) && (
        <div className="card p-3 text-sm text-red-700 border-red-200 bg-red-50 fade-up">
          {(appointments.error || patients.error) ? `Data load failed: ${appointments.error || patients.error}` : null}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 fade-up">
          <div className="text-sm text-gray-500">Patients</div>
          <div className="mt-2 text-2xl font-semibold">{totals.patients}</div>
          <div className="mt-1 text-xs text-gray-500">Total registered</div>
        </div>
        <div className="card p-5 fade-up">
          <div className="text-sm text-gray-500">Appointments</div>
          <div className="mt-2 text-2xl font-semibold">{totals.appointments}</div>
          <div className="mt-1 text-xs text-gray-500">Across all statuses</div>
        </div>
        <div className="card p-5 fade-up">
          <div className="text-sm text-gray-500">Confirmed</div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--color-success)]">{totals.confirmed}</div>
          <div className="mt-1 text-xs text-gray-500">Upcoming and confirmed</div>
        </div>
        <div className="card p-5 fade-up">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="mt-2 text-2xl font-semibold text-[color:var(--color-warn)]">{totals.pending}</div>
          <div className="mt-1 text-xs text-gray-500">Awaiting confirmation</div>
        </div>
      </section>

      <section className="card p-5 fade-up">
        <div className="mb-4 font-medium">Overview</div>
        <div className="grid gap-4 md:grid-cols-4">
          {series.map((s) => {
            const pct = Math.round((s.value / maxValue) * 100);
            return (
              <div key={s.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="badge" style={{ borderColor: s.color, color: s.color }}>{s.value}</span>
                </div>
                <div className="h-24 w-full rounded bg-[color:var(--color-muted)] overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: s.color }}
                    aria-label={`${s.label} ${s.value}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 fade-up">
          <div className="mb-2 font-medium">Quick links</div>
          <div className="flex flex-wrap gap-2">
            <Link href="/appointments" className="btn btn-primary">Manage appointments</Link>
            <Link href="/patients" className="btn btn-primary">Manage patients</Link>
            <Link href="/messages" className="btn btn-primary">Message center</Link>
          </div>
        </div>
        <div className="card p-5 fade-up">
          <div className="mb-2 font-medium">Status</div>
          <ul className="text-sm text-gray-700 list-disc pl-5">
            <li>RBAC enforced on write operations (doctor/admin)</li>
            <li>Session verification enabled on /api/*</li>
            <li>CSV exports available for appointments and patients</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
