"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { supabase, type Kegiatan } from '@/lib/supabase'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { compressImageToWebP } from '@/lib/image-utils'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'

export function KegiatanManager({ kegiatan, onUpdate }: { kegiatan: Kegiatan[]; onUpdate: () => void }) {
  // Supabase Storage bucket name; folder path is handled in the upload key below
  const MEDIA_BUCKET = 'pik-r-bukti'
  const [items, setItems] = useState<Kegiatan[]>(kegiatan)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Kegiatan | null>(null)

  const initialForm = {
    judul: '',
    deskripsi: '',
    tanggal: '',
    card_ratio: 'landscape' as 'landscape' | 'insta_4_5' | 'poster_2_3',
    image_url_1: '',
    image_url_2: '',
    image_url_3: '',
  }
  const [form, setForm] = useState<typeof initialForm>(initialForm)

  // image upload state
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => setItems(kegiatan), [kegiatan])

  // Search filter
  const [query, setQuery] = useState('')
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(it =>
      (it.judul || '').toLowerCase().includes(q) ||
      (it.deskripsi || '').toLowerCase().includes(q) ||
      (it.tanggal || '').toLowerCase().includes(q)
    )
  }, [items, query])

  const openModal = (item?: Kegiatan) => {
    setMessage(null)
    if (item) {
      setEditing(item)
      setForm({
        judul: item.judul,
        deskripsi: item.deskripsi || '',
        tanggal: item.tanggal || '',
        card_ratio: item.card_ratio ?? 'landscape',
        image_url_1: item.image_url_1 || '',
        image_url_2: item.image_url_2 || '',
        image_url_3: item.image_url_3 || '',
      })
      setPreviews([item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[])
    } else {
      setEditing(null)
      setForm(initialForm)
      setPreviews([])
    }
    setFiles(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (!f) return
    if (f.length > 3) {
      setMessage({ type: 'error', text: 'Maksimal 3 gambar.' })
      return
    }
    for (const file of Array.from(f)) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'File harus berupa gambar.' })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran gambar maks 5MB.' })
        return
      }
    }
    setFiles(f)
    setPreviews(Array.from(f).map(file => URL.createObjectURL(file)))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImageToWebP(file, 0.8)
    const ext = 'webp'
    const fileName = `kegiatan/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, compressed, {
      contentType: 'image/webp',
      upsert: false,
    })
    if (error) throw new Error(error.message)
    const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(data.path)
    return pub.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      let urls: string[] = [form.image_url_1, form.image_url_2, form.image_url_3].filter(Boolean) as string[]
      if (files && files.length) {
        setUploading(true)
        const uploads = await Promise.all(Array.from(files).map(f => uploadImage(f)))
        urls = uploads
      }
      const payload: Partial<Kegiatan> = {
        judul: form.judul.trim(),
        deskripsi: form.deskripsi?.trim() || null || undefined,
        tanggal: form.tanggal || null || undefined,
        card_ratio: form.card_ratio || 'landscape',
        image_url_1: urls[0] || null || undefined,
        image_url_2: urls[1] || null || undefined,
        image_url_3: urls[2] || null || undefined,
      }
      if (!payload.judul) throw new Error('Judul wajib diisi')

      const { error } = editing
        ? await supabase.from('kegiatan').update(payload).eq('id', editing.id)
        : await supabase.from('kegiatan').insert(payload)
      if (error) throw new Error(error.message)

      setMessage({ type: 'success', text: `Kegiatan berhasil ${editing ? 'diperbarui' : 'ditambahkan'}.` })
      onUpdate()
      closeModal()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: (err as Error).message || 'Terjadi kesalahan' })
    } finally {
      setUploading(false)
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kegiatan ini?')) return
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.from('kegiatan').delete().eq('id', id)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Kegiatan dihapus.' })
      onUpdate()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: (err as Error).message || 'Gagal menghapus' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <AdminLogo size="sm" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Kegiatan</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari kegiatan..."
            className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
          />
          <button onClick={() => openModal()} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Tambah Kegiatan
          </button>
        </div>
      </div>

      {message && (
        <div className={`mx-4 mt-4 rounded-md px-3 py-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="p-4 md:p-6">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada kegiatan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.judul}</h4>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openModal(item)} className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {item.tanggal && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.tanggal}</span>
                  </div>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">{item.deskripsi}</p>
                <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory -mx-1 px-1">
                  {[item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean).map((url, idx) => (
                    <Image
                      key={idx}
                      src={url as string}
                      alt={item.judul}
                      width={112}
                      height={80}
                      unoptimized
                      className="h-16 sm:h-20 w-24 sm:w-28 object-cover rounded-md border border-gray-200 dark:border-gray-700 snap-start shrink-0"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Edit' : 'Tambah'} Kegiatan</h4>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul</label>
                <input type="text" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                <textarea rows={4} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bentuk kartu</label>
                <select
                  value={form.card_ratio}
                  onChange={e => setForm({ ...form, card_ratio: e.target.value as NonNullable<Kegiatan['card_ratio']> })}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="landscape">Landscape (16:9) — kegiatan offline</option>
                  <option value="insta_4_5">Instagram Portrait (4:5)</option>
                  <option value="poster_2_3">Poster (2:3)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gambar (maks 3)</label>
                <input type="file" accept="image/*" multiple onChange={handleFilesSelect} className="mt-1 w-full text-sm" />
                {previews.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto snap-x snap-mandatory -mx-1 px-1">
                    {previews.map((src, i) => (
                      <Image
                        key={i}
                        src={src}
                        alt={`Preview gambar ${i + 1}`}
                        width={112}
                        height={80}
                        unoptimized
                        className="h-16 sm:h-20 w-24 sm:w-28 object-cover rounded-md border border-gray-200 dark:border-gray-700 snap-start shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 w-full sm:w-auto">Batal</button>
                <button disabled={loading || uploading} type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 w-full sm:w-auto">
                  {uploading ? 'Mengupload...' : (editing ? 'Simpan Perubahan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
