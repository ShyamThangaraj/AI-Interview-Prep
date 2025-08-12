'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return minLength && hasUpper && hasLower && hasNumber && hasSymbol
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setError(null)

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.')
      return
    }

    try {
      setLoading(true)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const cleanEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${siteUrl}/post-login` },
      })

      if (error) {
        const msg = error.message.toLowerCase()
        // If the user already exists, guide them to verify/login instead of blocking
        if (msg.includes('already')) {
          return router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}`)
        }
        window.alert(error.message)
        setError(error.message)
        setError("error.message")
        return
      }

      // With email confirmation ON, session is null for new signups. This is OK.
      return router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSignUp}
        className="bg-[#0d0d0d] border border-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-6 font-mono"
      >
        <h1 className="text-3xl font-bold text-center text-white tracking-wide">Create Account</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2 relative">
          <label htmlFor="password" className="text-sm text-gray-400">Password</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="password"
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 cursor-pointer select-none"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🔓' : '🔒'}
          </button>
          <ul className="text-xs text-gray-400 space-y-1 pl-2 mt-1">
            <li className={password.length >= 8 ? 'text-green-400' : 'text-red-400'}>• At least 8 characters</li>
            <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-red-400'}>• One uppercase letter</li>
            <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-red-400'}>• One lowercase letter</li>
            <li className={/[0-9]/.test(password) ? 'text-green-400' : 'text-red-400'}>• One number</li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-red-400'}>• One special character</li>
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="underline text-blue-400 hover:text-blue-300">Log In</Link>
        </p>
      </form>
    </main>
  )
}