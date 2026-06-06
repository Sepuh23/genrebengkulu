"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { type Kegiatan, supabase } from '@/lib/supabase'

export default function KegiatanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string | undefined

  const [item, setItem] = useState<Kegiatan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const numId = Number(id)
        if (Number.isNaN(numId)) {
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
        console.error('KegiatanDetailPage load error:', e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : e, { id })
        setError('Gagal memuat detail kegiatan')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!item) return
    const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
    if (images.length <= 1) return
    const idTimer = setInterval(() => setIndex((i) => (i + 1) % images.length), 4000)
    return () => clearInterval(idTimer)
  }, [item])

  if (!id) return null

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error || 'Data tidak ditemukan'}</p>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">Kembali</button>
      </div>
    )
  }

  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const current = images[index] || null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/kegiatans" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
          ← Kembali ke daftar kegiatan
        </Link>
      </div>

      <article>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{item.judul}</h1>
            {item.tanggal && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.tanggal}</p>
            )}
            {item.deskripsi && (
              <div className="mt-4 text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {item.deskripsi}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
