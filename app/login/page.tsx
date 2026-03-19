"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl" />
      </div>

      <main className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all hover:scale-105">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
            Admin Portal
          </h1>
          <p className="mt-1 text-zinc-500 font-medium text-sm">
            Bus Immersion Management System
          </p>
        </div>

        <div className="p-8 border border-zinc-200/60 shadow-xl shadow-zinc-200/50 rounded-3xl bg-white/70 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-white/50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black outline-none rounded-xl transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-white/50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black outline-none rounded-xl transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 bg-black text-white rounded-xl mt-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-800 disabled:opacity-70 flex items-center justify-center overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Viewing only?{" "}
          <Link
            href="/"
            className="text-black hover:underline underline-offset-4 ml-1"
          >
            Go back to seating
          </Link>
        </p>
      </main>
    </div>
  );
}
