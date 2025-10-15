"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientAuth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  

  const validate = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return false;
    }
    // Basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const auth = getClientAuth();
      if (!auth) {
        setError("Auth not ready. Please retry.");
        setLoading(false);
        return;
      }
      // Firebase Auth: sign in and create secure session via backend
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      
       const userDocRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        throw new Error("User record not found in database.");
      }

      const userData = userSnap.data();
      const role = userData.role;

      if (!role) {
        throw new Error("User role not assigned.");
      }

      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
      const resp = await fetch(`${base}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }), 
      });
      
      if (!resp.ok) throw new Error(`Session create failed (${resp.status})`);
       router.push(`/dashboard/${role}`);
      
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">Create one</Link>
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}