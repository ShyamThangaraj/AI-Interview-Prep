"use client"
import { useState } from "react"
import type React from "react"

import { supabase } from "@/app/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push(`/dashboard/${user.id}`)
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleLogin}
        className="bg-[#0d0d0d] border border-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-6 font-mono"
      >
        <h1 className="text-3xl font-bold text-center text-white tracking-wide">Welcome Back</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm text-gray-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-sm text-gray-400">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="bg-gray-900 border border-gray-700 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-9 text-gray-400 cursor-pointer select-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🔓" : "🔒"}
            </span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded text-white font-semibold transition flex items-center justify-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="underline text-blue-400 hover:text-blue-300">
            Sign Up
          </a>
        </p>
      </form>
    </main>
  )
}
