import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type StrukturJabatan = {
  id: number
  nama_jabatan: string
  urutan: number
}

export type Pengurus = {
  id: number
  nama: string
  ttl?: string | null
  jabatan_pengurus?: string | null
  asal_pikr?: string | null
  tlpn?: string | null
  email?: string | null
  instagram?: string | null
  image_url?: string | null
  jabatan_id?: number | null
  periode: string
  role_type?: 'administrator' | 'member'
}

export type PikRSubmission = {
  id: number
  nama: string
  ttl?: string | null
  asal_pikr: string
  alamat_lengkap: string
  tlpn?: string | null
  email?: string | null
  jabatan_pikr: string
  bukti_ss?: string | null
  submitted_at: string
}

export type FormControl = {
  id: boolean
  buka: string | null
  tutup: string | null
}

export type Kegiatan = {
  id: number
  judul: string
  deskripsi?: string | null
  tanggal?: string | null
  image_url_1?: string | null
  image_url_2?: string | null
  image_url_3?: string | null
  card_ratio?: 'landscape' | 'insta_4_5' | 'poster_2_3' | null
  created_at: string
}

export type DutaGenreCategory = {
  id: number
  key: string
  title: string
  order: number
  desired_count: number
}

export type DutaGenreWinner = {
  id: number
  category_id: number
  nama: string
  gender?: 'putra' | 'putri' | 'duo' | null
  asal?: string | null
  instagram?: string | null
  image_url?: string | null
  periode: string
  created_at: string
}

export type SiteSettings = {
  id: boolean
  bg_type: 'color' | 'image'
  bg_color: string
  bg_image_url: string | null
  updated_at: string
}