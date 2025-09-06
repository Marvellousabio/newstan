"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function useOnClickOutside<T extends HTMLElement>(ref: React.RefObject<T>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  useEffect(() => {
    // Client cookie check (session preferred)
    const ok = document.cookie.split(";").some((c) => {
      const t = c.trim();
      return t.startsWith("session=") || t.startsWith("auth=");
    });
    setIsAuthed(ok);
  }, [pathname]);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    // Clear client-side as fallback
    document.cookie = "session=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "auth=; Path=/; Max-Age=0; SameSite=Lax";
    setMenuOpen(false);
    router.push("/login");
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition-colors hover:text-[color:var(--color-link)] ${
          active ? "text-[color:var(--color-link)]" : "text-gray-700"
        }`}
      >
        <span>{children}</span>
        <span
          className={`absolute left-0 -bottom-1 h-0.5 w-full origin-left scale-x-0 bg-[color:var(--color-link)] transition-transform duration-200 ease-out ${
            active ? "scale-x-100" : "group-hover:scale-x-100"
          }`}
        />
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <Link href="/" className="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-[color:var(--bg-muted)]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white text-xs font-bold">M</span>
          <span className="font-semibold tracking-tight">Medical App</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-5">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/appointments">Appointments</NavLink>
          <NavLink href="/patients">Patients</NavLink>
          <NavLink href="/messages">Messages</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <Link href="/login" className="btn btn-muted">Login</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border px-2 py-1 hover:bg-[color:var(--bg-muted)] focus:outline-none focus:ring-2"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white text-xs font-semibold">U</span>
                <span className="hidden sm:block">Account</span>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {menuOpen && (
                <div role="menu" className="fade-up absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border bg-white shadow-lg">
                  <Link role="menuitem" href="/dashboard" className="block px-3 py-2 text-sm hover:bg-[color:var(--bg-muted)]">Dashboard</Link>
                  <Link role="menuitem" href="/appointments" className="block px-3 py-2 text-sm hover:bg-[color:var(--bg-muted)]">Appointments</Link>
                  <Link role="menuitem" href="/patients" className="block px-3 py-2 text-sm hover:bg-[color:var(--bg-muted)]">Patients</Link>
                  <Link role="menuitem" href="/messages" className="block px-3 py-2 text-sm hover:bg-[color:var(--bg-muted)]">Messages</Link>
                  <button role="menuitem" onClick={logout} className="block w-full text-left px-3 py-2 text-sm hover:bg-[color:var(--bg-muted)] text-[color:var(--color-danger)]">Log out</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
