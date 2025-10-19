import SymptomsForm from "@/components/dashboard/SymptomsForm";

export const dynamic = "force-dynamic";

export default function NewSymptomPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Report New Symptom</h1>
      </header>
      <SymptomsForm />
    </main>
  );
}
