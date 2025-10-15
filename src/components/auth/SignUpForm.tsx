"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, getClientAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {  doc, setDoc, serverTimestamp } from "firebase/firestore";


type Role = "mother" | "doctor" | "nurse" | "driver" | "admin";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<"mother" | "doctor" | "nurse" | "driver" | "admin" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    if (!name || !email || !password || !confirm || !role) {
      setError("All fields are required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
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
      // Firebase Auth: sign up and create secure session via backend
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      // Create user profile in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role,
        phone: null,
        location: { lat: 0, lng: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";



      const idToken = await cred.user.getIdToken(true);
      
      const resp = await fetch(`${base}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" , 'Authorization': `Bearer ${idToken}`,},
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
     
      if (!resp.ok) throw new Error(`Session create failed (${resp.status})`);
     const roleResp = await fetch(`${base}/api/users/${cred.user.uid}/set-role`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'

      },
      credentials: "include",
      body: JSON.stringify({ role})
    });
     if (!roleResp.ok) throw new Error(`Role assign failed (${roleResp.status})`);
      router.push(`/dashboard/${role}`);
      
    } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError("Sign up failed.");
    } finally {
      setLoading(false);
    }
      
  

  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-gray-600 mb-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role) }
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select role</option>
              <option value="mother">Mother</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="driver">Ambulance Driver</option>
              <option value="admin">Hospital Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
