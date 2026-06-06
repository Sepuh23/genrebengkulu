/**
 * Consolidated TypeScript types for GenRe Kota Bengkulu application
 */

import type { StaticImageData } from 'next/image'

// Database Types
export interface StrukturJabatan {
  id: number
  nama_jabatan: string
  urutan: number
}

export interface Pengurus {
  id: number
  nama: string
  instagram?: string
  image_url?: string
  jabatan_id: number
  periode: string
  role_type?: 'administrator' | 'member'
  struktur_jabatan?: StrukturJabatan
}

export interface PikRSubmission {
  id: number
  nama: string
  ttl?: string
  asal_pikr: string
  alamat_lengkap: string
  tlpn?: string
  email?: string
  jabatan_pikr: string
  bukti_ss?: string
  submitted_at: string
}

export interface FormControl {
  id: boolean
  buka: string | null
  tutup: string | null
}

export interface Kegiatan {
  id: number
  judul: string
  deskripsi?: string
  tanggal?: string
  image_url_1?: string
  image_url_2?: string
  image_url_3?: string
  created_at?: string
  card_ratio?: 'landscape' | 'insta_4_5' | 'poster_2_3'
}

export interface DutaGenreCategory {
  id: number
  key: string
  title: string
  order?: number
  desired_count?: number
}

export interface DutaGenreWinner {
  id: number
  category_id: number
  nama: string
  gender?: 'putra' | 'putri' | 'duo'
  asal?: string
  instagram?: string
  image_url?: string
  periode: string
  created_at?: string
}

// Component Props Types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorFallbackProps {
  error?: Error
  reset: () => void
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

export interface ThemeProviderProps {
  children: React.ReactNode
}

// Navigation Types
export interface NavItem {
  href: string
  label: string
}

// Asset Types
export interface AssetCollection {
  formQuestions: string | StaticImageData
  genre_bengkulu_logo: string | StaticImageData
  genrebackground: string | StaticImageData
  salamgenre: string | StaticImageData
  drink: string
  faq_image: string
  arrow_icon: string
  arrow_icon_white: string
}

// Form Types
export interface ContactFormData {
  nama: string
  email: string
  tlpn?: string
  pesan: string
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// Utility Types
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl'
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'
export type ButtonType = 'button' | 'submit' | 'reset'

// SEO Types
export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
}
