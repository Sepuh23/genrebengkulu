"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, type CSSProperties } from 'react'
import { type Kegiatan, supabase } from '@/lib/supabase'

function ratioClass(ratio?: Kegiatan['card_ratio']): string {
  switch (ratio) {
    case 'insta_4_5':
      return 'aspect-[4/5]'
    case 'poster_2_3':
      return 'aspect-[2/3]'
    case 'landscape':
    default:
      return 'aspect-[16/9]'
  }
}

function ratioStyle(ratio?: Kegiatan['card_ratio']): CSSProperties {
  switch (ratio) {
    case 'insta_4_5':
      return { aspectRatio: '4 / 5' }
    case 'poster_2_3':
      return { aspectRatio: '2 / 3' }
    case 'landscape':
    default:
      return { aspectRatio: '16 / 9' }
  }
}

function KegiatanCard({ item }: { item: Kegiatan }) {
  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // removed unused isExpanded and MAX_CHARS

  const hasSlider = images.length > 1
  const current = images[index] || null

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  // Autoplay every 4s; pause on hover
  useEffect(() => {
    if (!hasSlider || paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 4000)
    return () => clearInterval(id)
  }, [hasSlider, paused, images.length])

  return (
    <Link
      href={`/kegiatans?id=${item.id}`}
      className="group cursor-pointer break-inside-avoid mb-4 md:mb-5 lg:mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 block"
      aria-label={`Buka detail kegiatan ${item.judul}`}
    >
      {/* Slider with chosen aspect ratio */}
      {current ? (
        <div
          className={`relative group ${ratioClass(item.card_ratio)} rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm`}
          style={ratioStyle(item.card_ratio)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Image src={current} alt={item.judul} fill priority={false} sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="absolute inset-0 w-full h-full object-cover" />
          {/* Hover materi overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <h4 className="text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2">{item.judul}</h4>
              {item.tanggal && (
                <p className="text-[11px] text-red-200 mt-1">{item.tanggal}</p>
              )}
            </div>
          </div>
          {hasSlider && (
            <>
              {/* Controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                aria-label="Sebelumnya"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                aria-label="Berikutnya"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
              >
                ›
              </button>
              {/* Dots */}
              <div className="pointer-events-auto absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ke gambar ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIndex(i)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-5 bg-white dark:bg-gray-200' : 'w-2 bg-white/60 dark:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}
    </Link>
  )
}

export default function KegiatanList() {
  const [items, setItems] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // detail ditampilkan pada halaman baru /kegiatans/[id]
  const [filterDate, setFilterDate] = useState<string>('')

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch (e) {
      console.error(e)
      setError('Gagal memuat kegiatan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Realtime sync: listen to INSERT/UPDATE/DELETE and refresh
  useEffect(() => {
    const channel = supabase
      .channel('kegiatan-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kegiatan' }, () => {
        load()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-500" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-600 dark:text-gray-300">Belum ada kegiatan.</p>
    )
  }

  const filteredItems = items.filter((it) => {
    if (!filterDate) return true
    if (!it.tanggal) return true
    const t = new Date(it.tanggal)
    const f = new Date(filterDate)
    if (isNaN(t.getTime()) || isNaN(f.getTime())) return true
    const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return ymd(t) === ymd(f)
  })

  return (
    <>
      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tanggal</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Pilih tanggal"
              aria-label="Filter tanggal kegiatan"
              title="Pilih tanggal"
              className="w-full sm:w-56 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Menampilkan {filteredItems.length} dari {items.length}</span>
        </div>
      </div>

      {/* Masonry (CSS Columns) */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-x-4 md:gap-x-5 lg:gap-x-6">
        {filteredItems.map((item) => (
          <KegiatanCard key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}