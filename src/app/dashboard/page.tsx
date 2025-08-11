"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  email: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser({
        id: user.id,
        email: user.email || "",
      })
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-2 font-mono">
          <svg
            className="animate-spin h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-4 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center mt-4 px-4 mb-8">
        <Link href="/">
          <h2 className="text-3xl text-gray-400 font-mono ml-4 hover:text-white transition cursor-pointer">
            DREAMTERVIEW
          </h2>
        </Link>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-white hover:bg-white hover:text-black text-white rounded transition"
        >
          Sign Out
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[#0d0d0d] border border-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-white tracking-wide mb-6">Dashboard</h1>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">User ID</label>
              <div className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white break-all">
                {user?.id}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Email</label>
              <div className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white">{user?.email}</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Welcome to your DREAMTERVIEW dashboard!</p>
          </div>
        </div>
      </div>
    </main>
  )
}
