import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
}

async function getSymptom(id: string) {
  const base = getApiBase();
  const res = await fetch(`${base}/api/symptoms/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function updateSymptom(id: string, body: any) {
  const base = getApiBase();
  return fetch(`${base}/api/symptoms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function deleteSymptom(id: string) {
  const base = getApiBase();
  return fetch(`${base}/api/symptoms/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });
}

export default async function SymptomDetail({ params }: { params: { id: string } }) {
  const symptom = await getSymptom(params.id);
  if (!symptom) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Symptom not found.
        </div>
      </main>
    );
  }

  const s = symptom as any;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Symptom {s.id}</h1>
        <a href="/symptoms" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Back</a>
      </header>

      <section className="rounded-lg border bg-white p-5 shadow-sm space-y-2">
        <div>
          <div className="text-sm text-gray-600">Symptoms</div>
          <div className="whitespace-pre-wrap">{s.symptoms}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Duration</div>
          <div>{s.duration}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Pregnancy Weeks</div>
          <div>{s.pregnancyWeeks || '-'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Status</div>
          <div><span className="inline-flex rounded-full border px-2 py-0.5 text-xs">{s.status}</span></div>
        </div>
      </section>
    </main>
  );
}
