"use client"

import { useState, useEffect } from 'react'
import { supabase, type Pengurus } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { PengurusView } from '@/components/PengurusView'

export default function PengurusPage() {
  const [pengurus, setPengurus] = useState<Pengurus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPengurus()
  }, [])

  const fetchPengurus = async () => {
    try {
      // Fetch pengurus and struktur_jabatan separately to avoid schema cache issues
      const [pengurusResult, strukturResult] = await Promise.all([
        supabase.from('pengurus').select('*'),
        supabase.from('struktur_jabatan').select('*')
      ])

      if (pengurusResult.error) {
        console.error('Error fetching pengurus:', pengurusResult.error)
      }
      if (strukturResult.error) {
        console.error('Error fetching struktur_jabatan:', strukturResult.error)
      }

      // Manually join the data and filter to only public administrators
      const pengurusWithJabatan = (pengurusResult.data || [])
        .filter(p => (p.role_type ?? 'administrator') === 'administrator')
        .map(p => ({
          ...p,
          struktur_jabatan: strukturResult.data?.find(s => s.id === p.jabatan_id)
        }))

      setPengurus(pengurusWithJabatan)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation />

      {/* Organization Structure Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PengurusView pengurus={pengurus} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
