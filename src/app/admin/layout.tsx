'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AdminLogo } from '@/components/admin/AdminLogo'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
      </div>
    )
  }

  if (!user) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 bg-white/90 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <AdminLogo size="md" withLink />
              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Admin Dashboard Genre</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link
                href="/"
                className="hidden sm:inline-flex px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Lihat Situs Publik
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full space-y-6 p-6">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Admin Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Masuk ke dashboard admin PIK-R</p>
        </div>
        
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
