'use client'

import React, { useEffect, useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { DutaGenre, type DutaGenreCategory as UIDutaCategory, type DutaGenreWinner as UIWinner } from '@/components/DutaGenre'
import { supabase, type DutaGenreCategory, type DutaGenreWinner } from '@/lib/supabase'

export default function DutaGenrePage() {
  const now = new Date()
  const y = now.getFullYear()
  const periode = `${y}-${y + 1}`
  const [cats, setCats] = useState<UIDutaCategory[]>([])
  const [winners, setWinners] = useState<UIWinner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: catData }, { data: winData }] = await Promise.all([
          supabase.from('duta_genre_categories').select('*').order('order', { ascending: true }),
          supabase.from('duta_genre_winners').select('*').order('created_at', { ascending: false }),
        ])

        const mappedCats: UIDutaCategory[] = (catData || []).map((c: DutaGenreCategory) => ({
          id: c.id,
          key: c.key,
          title: c.title,
          order: c.order ?? undefined,
          desiredCount: c.desired_count ?? undefined,
        }))

        const mappedWinners: UIWinner[] = (winData || []).map((w: DutaGenreWinner) => ({
          id: w.id,
          category_id: w.category_id,
          nama: w.nama,
          gender: w.gender || undefined,
          asal: w.asal || undefined,
          instagram: w.instagram || undefined,
          periode: w.periode || undefined,
          image_url: w.image_url || undefined,
        }))

        setCats(mappedCats)
        setWinners(mappedWinners)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
            </div>
          ) : (
            <DutaGenre
              title="Duta GenRe Kota Bengkulu"
              periode={periode}
              categories={cats}
              winners={winners}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
