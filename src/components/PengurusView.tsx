'use client'

import React, { useMemo, useState } from 'react'
import { type Pengurus } from '@/lib/supabase'
import Image from 'next/image'
import { Instagram, Search, ClipboardList } from 'lucide-react'

interface OrganizationStructureProps {
  pengurus: Pengurus[]
}

export function PengurusView({ pengurus }: OrganizationStructureProps) {
  const [query, setQuery] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState<string | null>(null)

  // Group pengurus by periode
  const groupedByPeriode = useMemo(() => {
    return pengurus.reduce((acc, person) => {
      if (!acc[person.periode]) acc[person.periode] = []
      acc[person.periode].push(person)
      return acc
    }, {} as Record<string, Pengurus[]>)
  }, [pengurus])

  const periodes = useMemo(() => Object.keys(groupedByPeriode).sort().reverse(), [groupedByPeriode])
  const activePeriode = useMemo(() => {
    if (selectedPeriode) return selectedPeriode
    const y = new Date().getFullYear()
    const currentRange = `${y}-${y + 1}`
    if (periodes.includes(currentRange)) return currentRange
    return periodes[0] ?? ''
  }, [selectedPeriode, periodes])

  // Active pengurus for periode, sorted by urutan
  const activePengurus = useMemo(() => {
    const list = groupedByPeriode[activePeriode] ?? []
    return [...list].sort((a, b) => {
      const urA = a.struktur_jabatan?.urutan ?? 999
      const urB = b.struktur_jabatan?.urutan ?? 999
      return urA - urB
    })
  }, [groupedByPeriode, activePeriode])

  // Live filter by query (name, jabatan, alias)
  const filteredPengurus = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activePengurus
    return activePengurus.filter((p) => {
      const hay = `${p.nama} ${p.struktur_jabatan?.nama_jabatan ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [activePengurus, query])

  // Small groups (BPI, BPH, etc.) — keep original rules
  const getGroup = (p: Pengurus) => {
    const ur = p.struktur_jabatan?.urutan ?? 999
    if (ur <= 4) return 'bpi'
    // Previously BPH (5–6) is now merged into 'perencanaan'
    if (ur >= 5 && ur <= 8) return 'perencanaan'
    if (ur >= 9 && ur <= 10) return 'advokasi'
    if (ur >= 11 && ur <= 12) return 'data'
    if (ur >= 13 && ur <= 14) return 'ekonomi'
    return 'lainnya'
  }

  const groups = useMemo(() => {
    return filteredPengurus.reduce((acc: Record<string, Pengurus[]>, p) => {
      const g = getGroup(p)
      if (!acc[g]) acc[g] = []
      acc[g].push(p)
      return acc
    }, {})
  }, [filteredPengurus])

  // Identify BPI Ketua (urutan 1) and others for layout
  const bpiMembers = useMemo(() => groups['bpi'] ?? [], [groups])
  const ketuaBPI = useMemo(() => bpiMembers.find(p => p.struktur_jabatan?.urutan === 1) ?? null, [bpiMembers])
  const otherBPIMembers = useMemo(() => bpiMembers.filter(p => p.id !== (ketuaBPI?.id ?? -1)), [bpiMembers, ketuaBPI])

  if (pengurus.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-gray-100 rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500">
            Belum ada data struktur organisasi yang tersedia.
          </p>
        </div>
      </div>
    )
  }

  const MemberCard = ({ person, isLeadership = false }: { person: Pengurus; isLeadership?: boolean }) => {
    const roleLabel = person.struktur_jabatan?.nama_jabatan ?? 'Jabatan tidak diketahui'
    const fallback = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=60'
    const photo = person.image_url || fallback
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Detail ${person.nama}`}
        className={`group relative rounded-2xl bg-white/90 dark:bg-gray-800/80 shadow-sm hover:shadow-xl focus:shadow-xl transition-all duration-300 border border-gray-100/80 dark:border-gray-700/70 h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 flex flex-col`}
      >
        {/* Photo area: fully visible, no overlays */}
        <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl overflow-hidden">
          <Image
            src={photo}
            alt={person.nama}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="relative z-0 object-contain sm:object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] group-focus:scale-[1.03] group-focus-within:scale-[1.03] active:scale-[1.02]"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              try {
                (e.currentTarget as HTMLImageElement).src = fallback
              } catch {}
            }}
          />
          {/* subtle top shimmer */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-400/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 active:opacity-100 transition-opacity" />

          {/* Hover caption overlay inside image with detailed info */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 active:opacity-100 transition-opacity duration-300">
            {/* readability gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-base leading-tight truncate">{person.nama}</h4>
                  <p className={`text-[11px] mt-1 ${isLeadership ? 'text-yellow-300' : 'text-red-200'} truncate`}>{roleLabel}</p>
                </div>
                {isLeadership && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 text-yellow-100 px-2.5 py-0.5 text-[10px] font-semibold border border-yellow-300/40 shadow-sm">Inti</span>
                )}
              </div>

              <div className="mt-2 flex items-center justify-end text-[11px]">
                {person.instagram && (
                  <a
                    href={`https://instagram.com/${person.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full px-2 py-0.5 bg-pink-500/20 text-pink-100 hover:bg-pink-500/30 transition-colors border border-pink-300/30"
                  >
                    <Instagram className="w-4 h-4 mr-1.5" />
                    <span className="truncate">{person.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Caption area: does not cover the image */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 sm:gap-3">
            <h4 className="flex-1 min-w-0 font-semibold text-gray-900 dark:text-white text-base leading-tight truncate group-hover:text-red-700 dark:group-hover:text-red-300 group-focus:text-red-700 dark:group-focus:text-red-300 group-focus-within:text-red-700 dark:group-focus-within:text-red-300 transition-colors">{person.nama}</h4>
          </div>

          {/* No extra details here; details are shown on image hover */}
        </div>
        {/* outer hover ring */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-focus:ring-2 group-focus-within:ring-2 ring-red-200/60 dark:ring-red-800/40 transition-[ring]" />
      </div>
    )
  }

  return (
    <div className="from-red-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg dark:shadow-2xl px-4 py-6 sm:p-8 transition-colors duration-300">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="text-left sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengurus Forum GenRe Kota Bengkulu</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Periode <span className="font-semibold text-gray-800 dark:text-gray-100">{activePeriode}</span> · <span className="text-xs text-gray-500">{filteredPengurus.length} anggota</span></p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 dark:from-red-500 dark:to-red-600 rounded-full mt-3" />
        </div>

        <div className="flex-1 sm:flex-initial flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
          <label className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm w-full sm:w-[320px]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              aria-label="Cari nama atau jabatan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, jabatan, atau posisi..."
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-full"
            />
          </label>

          <div className="mt-2 sm:mt-0 sm:ml-3">
            <label className="sr-only" htmlFor="periode-select">Pilih Periode</label>
            <select
              id="periode-select"
              value={selectedPeriode ?? periodes[0] ?? ''}
              onChange={(e) => setSelectedPeriode(e.target.value || null)}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {periodes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BPI */}
      {bpiMembers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-1xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            <ClipboardList className="inline-block w-4 h-4 mr-2 align-[-2px]" />
            BPI
          </h2>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">🏆 BPI (Badan Pengurus Inti)</h3>

          {/* Ketua at centered top */}
          {ketuaBPI && (
            <div className="mb-6 flex justify-center">
              <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
                <MemberCard person={ketuaBPI} isLeadership />
              </div>
            </div>
          )}

          {/* Other BPI members below */}
          {otherBPIMembers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {otherBPIMembers.map((p, idx) => {
                // Stagger only the very first row under Ketua on large screens:
                // idx 0 (left) and idx 2 (right) raised slightly; idx 1 (center) normal
                const stagger = idx === 0 || idx === 2 ? ' lg:-mt-12' : ''
                return (
                  <div key={p.id} className={`h-full${stagger}`}>
                    <MemberCard person={p} isLeadership />
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* other groups (BPH removed) */}
      {['perencanaan', 'advokasi', 'data', 'ekonomi', 'lainnya'].map((gKey) => (
        groups[gKey] && groups[gKey].length > 0 ? (
          <section key={gKey} className="mb-8">
            {gKey === 'perencanaan' && (
              <h2 className="text-1xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                <ClipboardList className="inline-block w-4 h-4 mr-2 align-[-2px]" />
                BPH
              </h2>
            )}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
              {gKey === 'perencanaan' && '🎯 Bidang Perencanaan dan Pengembangan'}
              {gKey === 'advokasi' && '🤝 Bidang Advokasi dan Kerja Sama'}
              {gKey === 'data' && '📊 Bidang Data dan Informasi'}
              {gKey === 'ekonomi' && '💡 Bidang Ekonomi Kreatif'}
              {gKey === 'lainnya' && '👥 Lainnya'}
            </h3>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${['perencanaan','advokasi','data','ekonomi'].includes(gKey) ? 'gap-2 sm:gap-3 md:gap-4' : 'gap-6'} max-w-5xl mx-auto`}>
              {groups[gKey].map((p, idx) => (
                ['perencanaan','advokasi','data','ekonomi'].includes(gKey)
                  ? (
                      <div
                        key={p.id}
                        className={`w-full mx-auto sm:w-[88%] lg:w-[82%] sm:mx-0 ${idx % 2 === 0 ? 'sm:ml-auto' : 'sm:mr-auto'}`}
                      >
                        <MemberCard person={p} />
                      </div>
                    )
                  : (
                      <MemberCard key={p.id} person={p} />
                    )
              ))}
            </div>
          </section>
        ) : null
      ))}

      {/* other periods hint */}
      {periodes.length > 1 && (
        <div className="text-center pt-6 border-t border-white/50">
          <p className="text-sm text-gray-500">💼 Periode lainnya: {periodes.slice(1).join(', ')}</p>
        </div>
      )}
    </div>
  )
}
