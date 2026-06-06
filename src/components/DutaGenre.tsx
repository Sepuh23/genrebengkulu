"use client"

import React, { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

// Local types for Duta Genre page/component
export interface DutaGenreCategory {
  id: number
  key: string
  title: string
  order?: number
  desiredCount?: number
}

export interface DutaGenreWinner {
  id: number
  category_id: number
  nama: string
  gender?: 'putra' | 'putri' | 'duo'
  instagram?: string
  periode?: string
  image_url?: string
}

export interface DutaGenreProps {
  title: string
  periode: string
  categories: DutaGenreCategory[]
  winners: DutaGenreWinner[]
}

export const DutaGenre: React.FC<DutaGenreProps> = ({ title, periode, categories, winners }) => {
  // Filters
  const [query, setQuery] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')
  const [genderFilter, setGenderFilter] = useState<'all' | 'putra' | 'putri' | 'duo'>('all')
  // Toggle overlay details on tap/click for mobile usability
  const [openOverlayId, setOpenOverlayId] = useState<number | null>(null)

  // Category lookup by id for filtering/search label
  const catById = useMemo(() => {
    const m = new Map<number, DutaGenreCategory>()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  // Periode options derived from data
  const periodes = useMemo(() => {
    const set = new Set<string>()
    for (const w of winners) if (w.periode) set.add(w.periode)
    return Array.from(set).sort().reverse()
  }, [winners])
  const activePeriode = useMemo(() => {
    if (selectedPeriode) return selectedPeriode
    if (periode && periodes.includes(periode)) return periode
    return periodes[0] || ''
  }, [selectedPeriode, periode, periodes])

  // Filter winners by periode and query
  const filteredWinners = useMemo(() => {
    const q = query.trim().toLowerCase()
    return winners
      .filter(w => (activePeriode ? (w.periode === activePeriode) : true))
      .filter(w => (selectedCategoryId === 'all' ? true : w.category_id === selectedCategoryId))
      .filter(w => (genderFilter === 'all' ? true : (w.gender === genderFilter)))
      .filter(w => {
        if (!q) return true
        const catTitle = catById.get(w.category_id)?.title || ''
        const hay = `${w.nama} ${catTitle} ${w.instagram ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
  }, [winners, activePeriode, query, catById, selectedCategoryId, genderFilter])

  // Group filtered winners by category
  const winnersByCategory = useMemo(() => {
    const m = new Map<number, DutaGenreWinner[]>()
    for (const w of filteredWinners) {
      const arr = m.get(w.category_id) || []
      arr.push(w)
      m.set(w.category_id, arr)
    }
    return m
  }, [filteredWinners])

  // Only show real winners; do not generate placeholders
  const buildPlaceholders = (_cat: DutaGenreCategory, current: DutaGenreWinner[]) => current

  const catByKey = new Map<string, DutaGenreCategory>()
  for (const c of categories) catByKey.set(c.key, c)

  const renderCard = (cat: DutaGenreCategory, w: DutaGenreWinner) => (
    <article
      key={`${cat.id}-${w.id}`}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 w-full"
      role="button"
      tabIndex={0}
      onClick={() => setOpenOverlayId((prev) => (prev === w.id ? null : w.id))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpenOverlayId((prev) => (prev === w.id ? null : w.id))
        }
      }}
    >
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        {w.image_url && w.id > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={w.image_url}
            alt={w.nama}
            className={`w-full h-full object-cover transform transition-transform duration-300 ${
              openOverlayId === w.id ? 'scale-[1.05]' : 'group-hover:scale-[1.03]'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Placeholder</div>
        )}

        {/* Hover/click caption overlay with detailed info */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            openOverlayId === w.id
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100'
          }`}
        >
          {/* readability gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-semibold text-white text-sm sm:text-base leading-tight break-words whitespace-normal">{w.nama}</h4>
                <p className="text-[11px] mt-1 text-red-200 truncate">{cat.title}</p>
              </div>
            </div>

            {/* Instagram badges on overlay (if available) */}
            {w.instagram && w.id > 0 && (() => {
              const handles = (w.instagram || '')
                .split(/[\s,\/|]+/)
                .map(h => h.replace('@','').trim())
                .filter(Boolean)
              const toShow = (w.gender === 'duo') ? handles.slice(0,2) : handles.slice(0,1)
              return (
                <div className="mt-2 flex flex-wrap gap-2">
                  {toShow.map(h => (
                    <a
                      key={h}
                      href={`https://instagram.com/${h}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full px-2 py-0.5 bg-pink-500/20 text-pink-100 hover:bg-pink-500/30 transition-colors border border-pink-300/30 text-[11px]"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-1 fill-current">
                        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.6.5.7.3 1.3.6 1.9 1.2.6.6.9 1.2 1.2 1.9.3.7.5 1.4.5 2.6.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.5 2.6-.3.7-.6 1.3-1.2 1.9-.6.6-1.2.9-1.9 1.2-.7.3-1.4.5-2.6.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.6-.5-.7-.3-1.3-.6-1.9-1.2-.6-.6-.9-1.2-1.2-1.9-.3-.7-.5-1.4-.5-2.6C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.5-2.6.3-.7.6-1.3 1.2-1.9.6-.6 1.2-.9 1.9-1.2.7-.3 1.4-.5 2.6-.5C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.2 0-3.6 0-4.8.1-1 0-1.6.2-2 .3-.5.2-.8.3-1.1.6-.3.3-.5.6-.6 1.1-.1.4-.3 1-.3 2 0 1.2-.1 1.6-.1 4.8s0 3.6.1 4.8c0 1 .2 1.6.3 2 .2.5.3.8.6 1.1.3.3.6.5 1.1.6.4.1 1 .3 2 .3 1.2.1 1.6.1 4.8.1s3.6 0 4.8-.1c1 0 1.6-.2 2-.3.5-.2.8-.3 1.1-.6.3-.3.5-.6.6-1.1.1-.4.3-1 .3-2 .1-1.2.1-1.6.1-4.8s0-3.6-.1-4.8c0-1-.2-1.6-.3-2-.2-.5-.3-.8-.6-1.1-.3-.3-.6-.5-1.1-.6-.4-.1-1-.3-2-.3-1.2-.1-1.6-.1-4.8-.1Zm0 3.1a6.9 6.9 0 1 1 0 13.8 6.9 6.9 0 0 1 0-13.8Zm0 1.8a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm5.3-2.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
                      </svg>
                      @{h}
                    </a>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words whitespace-normal">{w.nama}</h4>
        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">{cat.title}</p>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-focus:ring-2 group-focus-within:ring-2 ring-red-200/60 dark:ring-red-800/40 transition-[ring]" />
    </article>
  )

  const renderCardWithTitle = (cat: DutaGenreCategory, w: DutaGenreWinner) => (
    <div key={`wrap-${cat.id}-${w.id}`} className="w-full">
      <header className="mb-2 text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{cat.title}</h3>
      </header>
      {renderCard(cat, w)}
    </div>
  )

  const renderCombinedRow = (keys: string[]) => {
    const cats = keys.map(k => catByKey.get(k)).filter(Boolean) as DutaGenreCategory[]
    const cards = cats
      .map(cat => {
        const raw = winnersByCategory.get(cat.id) || []
        if (raw.length === 0) return null
        const item = raw[0]
        return renderCardWithTitle(cat, item)
      })
      .filter(Boolean)
    const cols = Math.max(1, Math.min(3, cards.length))
    const smColsClass = cols === 1 ? 'sm:grid-cols-1' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
    // Mobile: 1 column. >= sm: dynamic columns based on available cards
    return (
      cards.length > 0 ? (
        <div className="w-full">
          <div className={`mx-auto grid grid-cols-1 gap-5 ${smColsClass}`} style={{ maxWidth: cols === 2 ? '56rem' : cols === 3 ? '72rem' : '28rem' }}>
            {cards}
          </div>
        </div>
      ) : null
    )
  }

  return (
    <div className="from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg dark:shadow-2xl px-4 py-6 sm:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="text-left sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Periode <span className="font-semibold text-gray-800 dark:text-gray-100">{activePeriode}</span></p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 dark:from-red-500 dark:to-red-600 rounded-full mt-3" />
        </div>

        <div className="flex-1 sm:flex-initial flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
          <label className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm w-full sm:w-[320px]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              aria-label="Cari pemenang Duta GenRe"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau kategori..."
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-full"
            />
          </label>

          <div className="mt-2 sm:mt-0 sm:ml-3">
            <label className="sr-only" htmlFor="periode-select">Pilih Periode</label>
            <select
              id="periode-select"
              value={activePeriode}
              onChange={(e) => setSelectedPeriode(e.target.value || null)}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {periodes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="mt-2 sm:mt-0 sm:ml-3">
            <label className="sr-only" htmlFor="category-select">Pilih Kategori</label>
            <select
              id="category-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <option value="all">Semua Kategori</option>
              {categories
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
            </select>
          </div>

          <div className="mt-2 sm:mt-0 sm:ml-3">
            <label className="sr-only" htmlFor="gender-select">Pilih Gender</label>
            <select
              id="gender-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as 'all' | 'putra' | 'putri' | 'duo')}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <option value="all">Semua Gender</option>
              <option value="putra">Putra</option>
              <option value="putri">Putri</option>
              <option value="duo">Duo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories and custom rows */}
      <div className="space-y-10">
        {/* 1) Juara Putra & Putri 1-3 combined */}
        {renderCombinedRow(['juara_1','juara_2','juara_3'])}

        {/* 2) Harapan 1-2 combined */}
        {renderCombinedRow(['harapan_1','harapan_2'])}

        {/* 3) Innovator, Berbakat, Terfavorit combined */}
        {renderCombinedRow(['innovator','berbakat','terfavorit'])}

        {/* Keep remaining categories as sections: include any not in combined rows */}
        {(() => {
          const combined = new Set(['juara_1','juara_2','juara_3','harapan_1','harapan_2','innovator','berbakat','terfavorit'])
          return categories
            .filter(c => !combined.has(c.key))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((cat) => {
              const raw = winnersByCategory.get(cat.id) || []
              if (raw.length === 0) return null
              const catWinners = buildPlaceholders(cat, raw)
              const cols = Math.max(1, Math.min(3, catWinners.length))
              const maxWidth = cols === 1 ? '28rem' : cols === 2 ? '56rem' : '72rem'
              const smColsClass = cols === 1 ? 'sm:grid-cols-1' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
              return (
                <section key={cat.id}>
                  <header className="mb-4 text-center">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{cat.title}</h3>
                  </header>
                  <div className="w-full">
                    <div className={`mx-auto grid grid-cols-1 gap-5 ${smColsClass}`} style={{ maxWidth }}>
                      {catWinners.map((w) => renderCard(cat, w))}
                    </div>
                  </div>
                </section>
              )
            })
            .filter(Boolean)
        })()}
      </div>
    </div>
  )
}
