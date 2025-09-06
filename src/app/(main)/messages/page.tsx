import Link from "next/link";
import MessagesClient from "@/components/dashboard/MessagesClient";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <main className="px-6 md:px-10">
      <section className="mx-auto max-w-6xl py-6 md:py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Message Center</h1>
              <p className="text-gray-600 mt-1">Secure threads between clinicians and patients. Real-time, encrypted in transit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/messages/new" className="btn btn-primary">New thread</Link>
            </div>
          </div>
        </div>

        <MessagesClient />
      </section>
    </main>
  );
}
