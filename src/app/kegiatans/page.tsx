"use client"

import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import KegiatanList from '@/components/KegiatanList'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { supabase, type Kegiatan } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

function KegiatansPageInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation />
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kegiatan</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Dokumentasi kegiatan dan aktivitas Genbi Kota Bengkulu.</p>
          </div>
          {id ? <KegiatanDetailInline id={id} /> : <KegiatanList />}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default function KegiatansPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-500" />
        </div>
      }
    >
      <KegiatansPageInner />
    </Suspense>
  )
}

function KegiatanDetailInline({ id }: { id: string }) {
  const router = useRouter()
  const [item, setItem] = useState<Kegiatan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const images = useMemo(
    () => [item?.image_url_1, item?.image_url_2, item?.image_url_3].filter(Boolean) as string[],
    [item]
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        // Coerce id to number to match DB column type and validate
        const numId = Number(id)
        if (!id || Number.isNaN(numId)) {
          setError('ID kegiatan tidak valid')
          return
        }
        const { data, error } = await supabase
          .from('kegiatan')
          .select('*')
          .eq('id', numId)
          .maybeSingle()
        if (error) throw error
        if (!data) {
          setError('Kegiatan tidak ditemukan')
          return
        }
        setItem(data)
      } catch (e) {
        console.error('KegiatanDetailInline load error:', e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : e, { id })
        setError('Gagal memuat detail kegiatan')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-500" />
      </div>
    )
  }
  if (error || !item) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error || 'Kegiatan tidak ditemukan.'}</p>
        <button
          onClick={() => router.push('/kegiatans')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Kembali ke daftar kegiatan"
          title="Kembali ke daftar kegiatan"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar
        </button>
      </div>
    )
  }

  const current = images[index] || null

  return (
    <article className="max-w-6xl mx-auto">
      <button
        onClick={() => router.push('/kegiatans')}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label="Kembali ke daftar kegiatan"
        title="Kembali ke daftar kegiatan"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Media on the left */}
        {current && (
          <div className="md:col-span-5">
            <div className="relative w-full overflow-hidden rounded-xl">
              <Image src={current} alt={item.judul} width={800} height={600} unoptimized className="w-full h-auto object-cover" />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Sebelumnya"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % images.length)}
                    aria-label="Berikutnya"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
                  >
                    ›
                  </button>
                  <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === index ? 'w-5 bg-white dark:bg-gray-200' : 'w-2 bg-white/60 dark:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content on the right */}
        <div className="md:col-span-7">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{item.judul}</h2>
          {item.tanggal && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.tanggal}</p>}
          {item.deskripsi && (
            <p className="mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-line">{item.deskripsi}</p>
          )}
        </div>
      </div>
    </article>
  )
}
