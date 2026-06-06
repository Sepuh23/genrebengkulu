'use client'

import React, { useMemo, useState } from 'react'
import { type Pengurus } from '@/lib/supabase'
import Image from 'next/image'
import { Instagram, Search, ClipboardList } from 'lucide-react'

interface StrukturJabatan {
  urutan: number
  nama_jabatan: string
}

interface ExtendedPengurus extends Pengurus {
  struktur_jabatan?: StrukturJabatan
}

interface OrganizationStructureProps {
  pengurus: ExtendedPengurus[]
}

export default function PengurusView({ pengurus }: OrganizationStructureProps) {
  const [query, setQuery] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState<string | null>(null)

  const groupedByPeriode = useMemo(() => {
    return pengurus.reduce((acc, person) => {
      if (!acc[person.periode]) acc[person.periode] = []
      acc[person.periode].push(person)
      return acc
    }, {} as Record<string, ExtendedPengurus[]>)
  }, [pengurus])

  const periodes = useMemo(() => Object.keys(groupedByPeriode).sort().reverse(), [groupedByPeriode])
  
  const activePeriode = useMemo(() => {
    if (selectedPeriode) return selectedPeriode
    const y = new Date().getFullYear()
    const currentRange = `${y}-${y + 1}`
    if (periodes.includes(currentRange)) return currentRange
    return periodes[0] ?? ''
  }, [selectedPeriode, periodes])

  const activePengurus = useMemo(() => {
    const list = groupedByPeriode[activePeriode] ?? []
    return [...list].sort((a, b) => {
      const urA = a.struktur_jabatan?.urutan ?? 999
      const urB = b.struktur_jabatan?.urutan ?? 999
      return urA - urB
    })
  }, [groupedByPeriode, activePeriode])

  const filteredPengurus = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activePengurus
    return activePengurus.filter((p) => {
      const hay = `${p.nama} ${p.struktur_jabatan?.nama_jabatan ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [activePengurus, query])

  const getGroup = (p: ExtendedPengurus) => {
    const ur = p.struktur_jabatan?.urutan ?? 999
    if (ur <= 4) return 'bpi'
    if (ur >= 5 && ur <= 8) return 'perencanaan'
    if (ur >= 9 && ur <= 10) return 'advokasi'
    if (ur >= 11 && ur <= 12) return 'data'
    if (ur >= 13 && ur <= 14) return 'ekonomi'
    return 'lainnya'
  }

  const groups = useMemo(() => {
    return filteredPengurus.reduce((acc: Record<string, ExtendedPengurus[]>, p) => {
      const g = getGroup(p)
      if (!acc[g]) acc[g] = []
      acc[g].push(p)
      return acc
    }, {})
  }, [filteredPengurus])

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
          <p className="text-gray-500">Belum ada data struktur organisasi yang tersedia.</p>
        </div>
      </div>
    )
  }

  const MemberCard = ({ person, isLeadership = false }: { person: ExtendedPengurus; isLeadership?: boolean }) => {
    const roleLabel = person.struktur_jabatan?.nama_jabatan ?? 'Jabatan tidak diketahui'
    const fallback = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=60'
    const photo = person.image_url || fallback
    return (
      <div className="group relative rounded-2xl bg-white/90 dark:bg-gray-800/80 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/80 dark:border-gray-700/70 h-full flex flex-col">
        <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl overflow-hidden">
          <Image src={photo} alt={person.nama} fill className="relative z-0 object-contain sm:object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback }} />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate">{person.nama}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{roleLabel}</p>
          {person.instagram && (
            <a href={`https://instagram.com/${person.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-pink-600 dark:text-pink-400 mt-2">
              <Instagram className="w-4 h-4" /> {person.instagram}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl shadow-lg px-4 py-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengurus Forum GenRe Kota Bengkulu</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Periode {activePeriode} · {filteredPengurus.length} anggota</p>
        </div>
        <div className="flex gap-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau jabatan..." className="px-3 py-2 border rounded-lg w-64" />
          <select value={selectedPeriode ?? periodes[0] ?? ''} onChange={(e) => setSelectedPeriode(e.target.value || null)} className="px-3 py-2 border rounded-lg">
            {periodes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {bpiMembers.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl font-bold text-center mb-4">🏆 BPI (Badan Pengurus Inti)</h3>
          {ketuaBPI && (
            <div className="mb-6 flex justify-center">
              <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
                <MemberCard person={ketuaBPI} isLeadership />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherBPIMembers.map(p => <MemberCard key={p.id} person={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
