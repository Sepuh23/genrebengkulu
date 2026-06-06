'use client'

import React, { useMemo, useState } from 'react'
import { type Pengurus } from '@/lib/supabase'
import Image from 'next/image'
import { Instagram, Search, ClipboardList } from 'lucide-react'

// Definisikan tipe untuk struktur_jabatan
interface StrukturJabatan {
  urutan: number
  nama_jabatan: string
}

// Perluas tipe Pengurus untuk include struktur_jabatan
interface ExtendedPengurus extends Pengurus {
  struktur_jabatan?: StrukturJabatan
}

interface OrganizationStructureProps {
  pengurus: ExtendedPengurus[]
}

// ✅ INI PERUBAHANNYA - tambahkan "default" setelah "export"
export default function PengurusView({ pengurus }: OrganizationStructureProps) {
  const [query, setQuery] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState<string | null>(null)
  
  // ... sisa kode sama seperti sebelumnya (sampai akhir)
}