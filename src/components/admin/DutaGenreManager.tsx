"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { supabase, type DutaGenreCategory, type DutaGenreWinner } from '@/lib/supabase'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { compressImageToWebP } from '@/lib/image-utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import XLSX from 'xlsx-js-style'

interface Props {
  categories: DutaGenreCategory[]
  winners: DutaGenreWinner[]
  onUpdate: () => void
}

export function DutaGenreManager({ categories, winners, onUpdate }: Props) {
  const [cats, setCats] = useState<DutaGenreCategory[]>(categories)
  const [items, setItems] = useState<DutaGenreWinner[]>(winners)
  const [loading, setLoading] = useState(false)
  const [, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [activeTab, setActiveTab] = useState<'winners' | 'categories'>('winners')
  // Multi-select state
  const [selectedWinnerIds, setSelectedWinnerIds] = useState<Set<number>>(new Set())
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set())

  useEffect(() => setCats(categories), [categories])
  useEffect(() => setItems(winners), [winners])

  // Filters
  const [periodeFilter, setPeriodeFilter] = useState('2024-2025')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [searchWinners, setSearchWinners] = useState('')
  const [searchCategories, setSearchCategories] = useState('')

  const filteredItems = useMemo(() => {
    const q = searchWinners.trim().toLowerCase()
    return items
      .filter(i => (periodeFilter ? i.periode === periodeFilter : true))
      .filter(i => (categoryFilter === 'all' ? true : i.category_id === categoryFilter))
      .filter(i => {
        if (!q) return true
        const cat = categories.find(c => c.id === i.category_id)
        return (
          (i.nama || '').toLowerCase().includes(q) ||
          (i.periode || '').toLowerCase().includes(q) ||
          (cat?.title || '').toLowerCase().includes(q)
        )
      })
  }, [items, periodeFilter, categoryFilter, searchWinners, categories])

  const filteredCategories = useMemo(() => {
    const q = searchCategories.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(c =>
      (c.key || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q)
    )
  }, [categories, searchCategories])

  // Export helpers — Winners
  const buildWinnerRows = () => {
    const header = ['ID', 'Nama', 'Kategori', 'Gender', 'Instagram', 'Periode', 'Gambar']
    const rows = filteredItems.map(w => {
      const cat = categories.find(c => c.id === w.category_id)
      return [
        w.id,
        w.nama || '',
        cat?.title || '',
        w.gender || '',
        w.instagram || '',
        w.periode || '',
        w.image_url || '',
      ]
    })
    return { header, rows }
  }

  const exportWinnersCSV = () => {
    const { header, rows } = buildWinnerRows()
    const csvLines = [header, ...rows].map(r => r.map(cell => {
      const v = String(cell ?? '')
      if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"'
      return v
    }).join(','))
    const csvContent = '\ufeff' + csvLines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duta_winners_${periodeFilter || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportWinnersXLSX = () => {
    const { header, rows } = buildWinnerRows()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'Winners')
    XLSX.writeFile(wb, `duta_winners_${periodeFilter || 'all'}.xlsx`)
  }

  // Export helpers — Categories
  const buildCategoryRows = () => {
    const header = ['ID', 'Key', 'Judul', 'Urutan', 'Target Kartu']
    const rows = filteredCategories.map(c => [
      c.id,
      c.key,
      c.title,
      c.order ?? 0,
      c.desired_count ?? 0,
    ])
    return { header, rows }
  }

  const exportCategoriesCSV = () => {
    const { header, rows } = buildCategoryRows()
    const csvLines = [header, ...rows].map(r => r.map(cell => {
      const v = String(cell ?? '')
      if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"'
      return v
    }).join(','))
    const csvContent = '\ufeff' + csvLines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'duta_categories.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCategoriesXLSX = () => {
    const { header, rows } = buildCategoryRows()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'Categories')
    XLSX.writeFile(wb, 'duta_categories.xlsx')
  }

  // Selection helpers - Winners
  const isWinnerSelected = (id: number) => selectedWinnerIds.has(id)
  const toggleWinnerSelect = (id: number) => {
    setSelectedWinnerIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleWinnersSelectAll = () => {
    if (selectedWinnerIds.size === filteredItems.length) setSelectedWinnerIds(new Set())
    else setSelectedWinnerIds(new Set(filteredItems.map(i => i.id)))
  }

  // Selection helpers - Categories
  const isCategorySelected = (id: number) => selectedCategoryIds.has(id)
  const toggleCategorySelect = (id: number) => {
    setSelectedCategoryIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleCategoriesSelectAll = () => {
    if (selectedCategoryIds.size === filteredCategories.length) setSelectedCategoryIds(new Set())
    else setSelectedCategoryIds(new Set(filteredCategories.map(c => c.id)))
  }

  const bulkDelete = async (target: 'winners' | 'categories') => {
    const ids = target === 'winners' ? Array.from(selectedWinnerIds) : Array.from(selectedCategoryIds)
    if (!ids.length) return
    const label = target === 'winners' ? 'pemenang' : 'kategori'
    if (!confirm(`Hapus ${ids.length} ${label} terpilih? Tindakan ini tidak dapat dibatalkan.`)) return
    try {
      setLoading(true)
      const table = target === 'winners' ? 'duta_genre_winners' : 'duta_genre_categories'
      const { error } = await supabase.from(table).delete().in('id', ids)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: `${ids.length} ${label} dihapus.` })
      if (target === 'winners') setSelectedWinnerIds(new Set()); else setSelectedCategoryIds(new Set())
      onUpdate()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: (err as Error).message || 'Gagal menghapus' })
    } finally {
      setLoading(false)
    }
  }

  const periodOptions = useMemo(() => {
    const all = [...items.map(i => i.periode), periodeFilter || '2024-2025']
    return Array.from(new Set(all.filter(Boolean)))
  }, [items, periodeFilter])

  // Winner modal state
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
  const [editingWinner, setEditingWinner] = useState<DutaGenreWinner | null>(null)
  const initialWinnerForm = {
    category_id: 0,
    nama: '',
    gender: '' as '' | 'putra' | 'putri' | 'duo',
    instagram: '',
    periode: '2024-2025',
    image_url: '',
  }
  const [winnerForm, setWinnerForm] = useState(initialWinnerForm)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const openWinnerModal = (w?: DutaGenreWinner) => {
    setMessage(null)
    if (w) {
      setEditingWinner(w)
      setWinnerForm({
        category_id: w.category_id,
        nama: w.nama,
        gender: w.gender || '',
        instagram: w.instagram || '',
        periode: w.periode,
        image_url: w.image_url || '',
      })
      setPreview(w.image_url || null)
    } else {
      setEditingWinner(null)
      setWinnerForm({ ...initialWinnerForm, category_id: cats[0]?.id || 0, periode: periodeFilter || '2024-2025' })
      setPreview(null)
    }
    setFile(null)
    setIsWinnerModalOpen(true)
  }

  const closeWinnerModal = () => setIsWinnerModalOpen(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar.' })
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maks 5MB.' })
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImageToWebP(file, 0.8)
    const ext = 'webp'
    const fileName = `duta-genre/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('pik-r-bukti').upload(fileName, compressed, {
      contentType: 'image/webp',
      upsert: false,
    })
    if (error) throw new Error(error.message)
    const { data: pub } = supabase.storage.from('pik-r-bukti').getPublicUrl(data.path)
    return pub.publicUrl
  }

  const submitWinner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage(null)
      let finalImage = winnerForm.image_url
      if (file) {
        setUploading(true)
        finalImage = await uploadImage(file)
      }
      const payload: Partial<DutaGenreWinner> = {
        category_id: winnerForm.category_id,
        nama: winnerForm.nama.trim(),
        gender: winnerForm.gender || undefined,
        instagram: winnerForm.instagram?.trim() || undefined,
        image_url: finalImage || undefined,
        periode: winnerForm.periode,
      }
      if (!payload.category_id) throw new Error('Kategori wajib dipilih')
      if (!payload.nama) throw new Error('Nama wajib diisi')
      if (!payload.periode) throw new Error('Periode wajib diisi')

      const { error } = editingWinner
        ? await supabase.from('duta_genre_winners').update(payload).eq('id', editingWinner.id)
        : await supabase.from('duta_genre_winners').insert(payload)
      if (error) throw new Error(error.message)

      setMessage({ type: 'success', text: `Data pemenang berhasil ${editingWinner ? 'diperbarui' : 'ditambahkan'}.` })
      onUpdate()
      closeWinnerModal()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: (err as Error).message || 'Terjadi kesalahan' })
    } finally {
      setUploading(false)
      setLoading(false)
    }
  }

  const deleteWinner = async (id: number) => {
    if (!confirm('Hapus data pemenang ini?')) return
    try {
      setLoading(true)
      const { error } = await supabase.from('duta_genre_winners').delete().eq('id', id)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Pemenang dihapus.' })
      onUpdate()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: (err as Error).message || 'Gagal menghapus' })
    } finally {
      setLoading(false)
    }
  }

  // Category forms
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<DutaGenreCategory | null>(null)
  const initialCatForm = { key: '', title: '', order: 0, desired_count: 0 }
  const [catForm, setCatForm] = useState(initialCatForm)

  const openCatModal = (c?: DutaGenreCategory) => {
    setMessage(null)
    if (c) {
      setEditingCat(c)
      setCatForm({ key: c.key, title: c.title, order: c.order || 0, desired_count: c.desired_count || 0 })
    } else {
      setEditingCat(null)
      setCatForm(initialCatForm)
    }
    setIsCatModalOpen(true)
  }

  const closeCatModal = () => setIsCatModalOpen(false)

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage(null)
      const payload: Partial<DutaGenreCategory> = {
        key: catForm.key.trim(),
        title: catForm.title.trim(),
        order: Number(catForm.order) || 0,
        desired_count: Number(catForm.desired_count) || 0,
      }
      if (!payload.key) throw new Error('Key kategori wajib diisi')
      if (!payload.title) throw new Error('Judul kategori wajib diisi')

      const { error } = editingCat
        ? await supabase.from('duta_genre_categories').update(payload).eq('id', editingCat.id)
        : await supabase.from('duta_genre_categories').insert(payload)
      if (error) throw new Error(error.message)

      setMessage({ type: 'success', text: `Kategori berhasil ${editingCat ? 'diperbarui' : 'ditambahkan'}.` })
      onUpdate()
      closeCatModal()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: (err as Error).message || 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('Hapus kategori ini? Semua pemenang pada kategori ini juga akan terhapus.')) return
    try {
      setLoading(true)
      const { error } = await supabase.from('duta_genre_categories').delete().eq('id', id)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Kategori dihapus.' })
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
      {/* Top tabs */}
      <div className="px-4 pt-4 md:px-6 md:pt-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'winners' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
          onClick={() => setActiveTab('winners')}
        >
          Pemenang
        </button>
        <button
          className={`px-3 py-2 rounded-t-md text-sm font-medium ${activeTab === 'categories' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
          onClick={() => setActiveTab('categories')}
        >
          Kategori
        </button>
      </div>

      {/* Winners list */}
      {activeTab === 'winners' && (
        <div>
          <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <AdminLogo size="sm" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Duta GenRe</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select value={periodeFilter} onChange={e => setPeriodeFilter(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm">
                {periodOptions.map(p => <option key={`periode-${p}`} value={p}>{p}</option>)}
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm">
                <option value="all">Semua Kategori</option>
                {cats.sort((a,b)=> (a.order||0)-(b.order||0)).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchWinners}
                onChange={e => setSearchWinners(e.target.value)}
                placeholder="Cari nama, periode, kategori..."
                className="w-full sm:w-72 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
              />
              
              <div className="flex items-center gap-2">
                <button onClick={exportWinnersCSV} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Export CSV</button>
                <button onClick={exportWinnersXLSX} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Export XLSX</button>
              </div>
              {selectedWinnerIds.size > 0 && (
                <button onClick={() => bulkDelete('winners')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto">
                  <Trash2 className="w-4 h-4" /> Hapus Terpilih ({selectedWinnerIds.size})
                </button>
              )}
              <button onClick={() => openWinnerModal()} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Tambah Pemenang
              </button>
            </div>
          </div>
          <div className="p-4 md:p-6 overflow-x-auto">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada pemenang.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua pemenang"
                        checked={filteredItems.length > 0 && selectedWinnerIds.size === filteredItems.length}
                        onChange={toggleWinnersSelectAll}
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Foto</th>
                    <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                    <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Gender</th>
                    
                    <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Periode</th>
                    <th scope="col" className="relative px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50"><span className="sr-only">Aksi</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map(w => {
                    const category = cats.find(c => c.id === w.category_id)
                    return (
                      <tr key={w.id}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            aria-label={`Pilih ${w.nama}`}
                            checked={isWinnerSelected(w.id)}
                            onChange={() => toggleWinnerSelect(w.id)}
                          />
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {w.image_url ? (
                            <Image src={w.image_url} alt={w.nama} width={40} height={40} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words min-w-[160px]">{w.nama}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-normal break-words min-w-[140px]">{category?.title || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{w.gender || '-'}</td>
                        
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{w.periode || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          <button onClick={() => openWinnerModal(w)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Pencil className="h-5 w-5" /></button>
                          <button onClick={() => deleteWinner(w.id)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Trash2 className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Categories list */}
      {activeTab === 'categories' && (
        <div>
          <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <AdminLogo size="sm" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Kategori Duta GenRe</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchCategories}
                onChange={e => setSearchCategories(e.target.value)}
                placeholder="Cari key atau judul kategori..."
                className="w-full sm:w-72 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
              />
              
              <div className="flex items-center gap-2">
                <button onClick={exportCategoriesCSV} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Export CSV</button>
                <button onClick={exportCategoriesXLSX} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Export XLSX</button>
              </div>
              {selectedCategoryIds.size > 0 && (
                <button onClick={() => bulkDelete('categories')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto">
                  <Trash2 className="w-4 h-4" /> Hapus Terpilih ({selectedCategoryIds.size})
                </button>
              )}
              <button onClick={() => openCatModal()} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Tambah Kategori
              </button>
            </div>
          </div>
          <div className="p-4 md:p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua kategori"
                      checked={filteredCategories.length > 0 && selectedCategoryIds.size === filteredCategories.length}
                      onChange={toggleCategoriesSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Judul</th>
                  <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Key</th>
                  <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Urutan</th>
                  <th scope="col" className="px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Target Kartu</th>
                  <th scope="col" className="relative px-6 py-3 sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCategories.sort((a,b)=> (a.order||0)-(b.order||0)).map(c => (
                  <tr key={c.id}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Pilih kategori ${c.title}`}
                        checked={isCategorySelected(c.id)}
                        onChange={() => toggleCategorySelect(c.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-normal break-words min-w-[160px]">{c.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-normal break-words">{c.key}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{c.order ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{c.desired_count ?? 0}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button onClick={() => openCatModal(c)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Pencil className="h-5 w-5" /></button>
                      <button onClick={() => deleteCategory(c.id)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Trash2 className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {isWinnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{editingWinner ? 'Edit' : 'Tambah'} Pemenang</h4>
              <button onClick={() => setIsWinnerModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={submitWinner} className="p-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium">Kategori</label>
                <select
                  value={winnerForm.category_id}
                  onChange={e=> {
                    const newId = Number(e.target.value)
                    const newCat = cats.find(c=> c.id === newId)
                    const isKelurahan = newCat?.key?.toLowerCase().includes('kelurahan')
                    setWinnerForm({
                      ...winnerForm,
                      category_id: newId,
                      // if switching to kelurahan and gender was 'duo', reset gender
                      gender: isKelurahan && winnerForm.gender === 'duo' ? '' : winnerForm.gender,
                    })
                  }}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  {cats.sort((a,b)=> (a.order||0)-(b.order||0)).map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Nama</label>
                <input type="text" value={winnerForm.nama} onChange={e=> setWinnerForm({...winnerForm, nama: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Gender</label>
                  {(() => {
                    const selectedCat = cats.find(c=> c.id === winnerForm.category_id)
                    const allowDuo = selectedCat ? !selectedCat.key.toLowerCase().includes('kelurahan') : true
                    return (
                      <select
                        value={winnerForm.gender}
                        onChange={e=> setWinnerForm({...winnerForm, gender: e.target.value as 'putra' | 'putri' | 'duo' | ''})}
                        className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                      >
                        <option value="">-</option>
                        <option value="putra">Putra</option>
                        <option value="putri">Putri</option>
                        {allowDuo && <option value="duo">Duo</option>}
                      </select>
                    )
                  })()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Instagram</label>
                <input
                  type="text"
                  value={winnerForm.instagram}
                  onChange={e=> setWinnerForm({...winnerForm, instagram: e.target.value})}
                  placeholder={winnerForm.gender === 'duo' ? '@akun1 @akun2' : '@akun'}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                />
                {winnerForm.gender === 'duo' ? (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Pisahkan 2 akun dengan spasi, koma, garis miring, atau |. Contoh: &quot;@akun1 @akun2&quot;</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Contoh: &quot;@akun&quot;</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Periode</label>
                  <input type="text" value={winnerForm.periode} onChange={e=> setWinnerForm({...winnerForm, periode: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Gambar</label>
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="mt-1 w-full text-sm" />
                  {preview && <Image src={preview} alt="Preview gambar" width={128} height={96} unoptimized className="mt-2 h-24 w-32 object-cover rounded-md border border-gray-200 dark:border-gray-700" />}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
                <button type="button" onClick={closeWinnerModal} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 w-full sm:w-auto">Batal</button>
                <button disabled={loading || uploading} type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 w-full sm:w-auto">
                  {uploading ? 'Mengupload...' : (editingWinner ? 'Simpan Perubahan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{editingCat ? 'Edit' : 'Tambah'} Kategori</h4>
              <button onClick={() => setIsCatModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <form onSubmit={submitCategory} className="p-4 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Key</label>
                  <input type="text" value={catForm.key} onChange={e=> setCatForm({...catForm, key: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Urutan</label>
                  <input type="number" value={catForm.order} onChange={e=> setCatForm({...catForm, order: Number(e.target.value)})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Judul</label>
                <input type="text" value={catForm.title} onChange={e=> setCatForm({...catForm, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Target Kartu (desired_count)</label>
                <input type="number" value={catForm.desired_count} onChange={e=> setCatForm({...catForm, desired_count: Number(e.target.value)})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 w-full sm:w-auto">Batal</button>
                <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 w-full sm:w-auto">
                  {editingCat ? 'Simpan Perubahan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
