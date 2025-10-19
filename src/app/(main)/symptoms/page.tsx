import Link from "next/link";

export const dynamic = "force-dynamic";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

export default async function SymptomsPage() {
  const base = getApiBase();
  const res = await fetch(`${base}/api/symptoms`, { cache: "no-store" });
  const items = res.ok ? await res.json() : [];

  return (
    <main className="px-6 md:px-10">
      <section className="mx-auto max-w-6xl py-6 md:py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Symptoms</h1>
            <p className="text-gray-600 mt-1">Track and manage reported symptoms</p>
          </div>
          <Link href="/symptoms/new" className="btn btn-primary">New symptom</Link>
        </div>

        <section className="card bg-white/90 backdrop-blur overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">ID</th>
                <th className="px-5 py-2 text-left font-medium">Symptoms</th>
                <th className="px-5 py-2 text-left font-medium">Duration</th>
                <th className="px-5 py-2 text-left font-medium">Pregnancy Weeks</th>
                <th className="px-5 py-2 text-left font-medium">Status</th>
                <th className="px-5 py-2 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-gray-500" colSpan={6}>
                    No symptoms submitted yet.
                  </td>
                </tr>
              ) : (
                items.map((r: any, idx: number) => (
                  <tr key={r.id} className={idx % 2 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="px-5 py-2 font-mono text-blue-700 underline">
                      <Link href={`/symptoms/${r.id}`}>{r.id}</Link>
                    </td>
                    <td className="px-5 py-2">{r.symptoms}</td>
                    <td className="px-5 py-2">{r.duration}</td>
                    <td className="px-5 py-2">{r.pregnancyWeeks || '-'}</td>
                    <td className="px-5 py-2">{r.status}</td>
                    <td className="px-5 py-2 whitespace-nowrap">{r.createdAt}</td>
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
