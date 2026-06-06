'use client'

import { useState, useMemo, Fragment } from 'react'
import Image from 'next/image'
import { supabase, type Pengurus, type StrukturJabatan } from '@/lib/supabase'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { compressImageToWebP } from '@/lib/image-utils'
import { Plus, Trash2, User, Save, ChevronsUpDown, Users, Briefcase, Edit } from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import XLSX from 'xlsx-js-style'

interface OrganizationManagerProps {
  pengurus: Pengurus[]
  strukturJabatan: StrukturJabatan[]
  onUpdate: () => void
}

export function OrganizationManager({ pengurus, strukturJabatan, onUpdate }: OrganizationManagerProps) {
  const [activeTab, setActiveTab] = useState<'pengurus' | 'struktur'>('pengurus')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Pengurus | StrukturJabatan | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPeriode, setSelectedPeriode] = useState<string>('all')
  // Multi-select state
  const [selectedPengurusIds, setSelectedPengurusIds] = useState<Set<number>>(new Set())
  const [selectedStrukturIds, setSelectedStrukturIds] = useState<Set<number>>(new Set())

  const defaultPeriode = new Date().getFullYear().toString()

  const initialPengurusForm = {
    nama: '',
    instagram: '',
    image_url: '',
    jabatan_id: '',
    periode: defaultPeriode,
    role_type: 'administrator' as 'administrator' | 'member',
  }

  const initialStrukturForm = {
    nama_jabatan: '',
    urutan: '',
  }

  const [pengurusForm, setPengurusForm] = useState(initialPengurusForm)
  const [strukturForm, setStrukturForm] = useState(initialStrukturForm)
  const [selectedRoleType, setSelectedRoleType] = useState<'all' | 'administrator' | 'member'>('all')
  // Search queries
  const [searchPengurus, setSearchPengurus] = useState('')
  const [searchStruktur, setSearchStruktur] = useState('')

  const periodes = useMemo(() => {
    const allPeriodes = pengurus.map(p => p.periode).filter(Boolean) as string[]
    return ['all', ...Array.from(new Set(allPeriodes)).sort((a, b) => b.localeCompare(a))]
  }, [pengurus])

  const filteredPengurus = useMemo(() => {
    let list = pengurus
    if (selectedPeriode !== 'all') list = list.filter(p => p.periode === selectedPeriode)
    if (selectedRoleType !== 'all') list = list.filter(p => (p.role_type ?? 'administrator') === selectedRoleType)
    const q = searchPengurus.trim().toLowerCase()
    if (!q) return list
    return list.filter(p => {
      const jabatanName = strukturJabatan.find(j => j.id === p.jabatan_id)?.nama_jabatan || ''
      return (
        (p.nama || '').toLowerCase().includes(q) ||
        (p.instagram || '').toLowerCase().includes(q) ||
        (p.periode || '').toLowerCase().includes(q) ||
        jabatanName.toLowerCase().includes(q)
      )
    })
  }, [pengurus, selectedPeriode, selectedRoleType, searchPengurus, strukturJabatan])

  // Export helpers for Pengurus
  const buildPengurusRows = () => {
    const header = [
      'ID', 'Nama', 'Jabatan', 'Instagram', 'Periode', 'Tipe'
    ]
    const rows = filteredPengurus.map(p => [
      p.id,
      p.nama || '',
      strukturJabatan.find(j => j.id === p.jabatan_id)?.nama_jabatan || '',
      p.instagram || '',
      p.periode || '',
      p.role_type || 'administrator',
    ])
    return { header, rows }
  }

  const exportPengurusCSV = () => {
    const { header, rows } = buildPengurusRows()
    const csvLines = [header, ...rows].map(r => r.map(cell => {
      const v = String(cell ?? '')
      if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"'
      return v
    }).join(','))
    const csvContent = '\ufeff' + csvLines.join('\n') // BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const periodLabel = selectedPeriode === 'all' ? 'semua' : selectedPeriode
    a.download = `pengurus_${periodLabel}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPengurusXLSX = () => {
    const { header, rows } = buildPengurusRows()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'Pengurus')
    const periodLabel = selectedPeriode === 'all' ? 'semua' : selectedPeriode
    XLSX.writeFile(wb, `pengurus_${periodLabel}.xlsx`)
  }

  const filteredStruktur = useMemo(() => {
    const q = searchStruktur.trim().toLowerCase()
    const list = [...strukturJabatan]
    if (!q) return list
    return list.filter(s => (s.nama_jabatan || '').toLowerCase().includes(q))
  }, [strukturJabatan, searchStruktur])

  // Selection helpers - Pengurus
  const isPengurusSelected = (id: number) => selectedPengurusIds.has(id)
  const togglePengurusSelect = (id: number) => {
    setSelectedPengurusIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const togglePengurusSelectAll = () => {
    if (selectedPengurusIds.size === filteredPengurus.length) {
      setSelectedPengurusIds(new Set())
    } else {
      setSelectedPengurusIds(new Set(filteredPengurus.map(p => p.id)))
    }
  }

  // Selection helpers - Struktur
  const isStrukturSelected = (id: number) => selectedStrukturIds.has(id)
  const toggleStrukturSelect = (id: number) => {
    setSelectedStrukturIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleStrukturSelectAll = () => {
    if (selectedStrukturIds.size === filteredStruktur.length) {
      setSelectedStrukturIds(new Set())
    } else {
      setSelectedStrukturIds(new Set(filteredStruktur.map(s => s.id)))
    }
  }

  // Bulk delete handler
  const handleBulkDelete = async (target: 'pengurus' | 'struktur', mode: 'selected' | 'all') => {
    const table = target === 'pengurus' ? 'pengurus' : 'struktur_jabatan'
    let ids: number[] = []
    if (target === 'pengurus') {
      ids = mode === 'selected' ? Array.from(selectedPengurusIds) : filteredPengurus.map(p => p.id)
    } else {
      const rawIds = mode === 'selected' ? Array.from(selectedStrukturIds) : filteredStruktur.map(s => s.id)
      // Protect Struktur rows that are referenced by pengurus
      const nonDeletable = new Set(pengurus.map(p => p.jabatan_id))
      const deletable = rawIds.filter(id => !nonDeletable.has(id))
      ids = deletable
      if (rawIds.length && deletable.length < rawIds.length) {
        setMessage({ type: 'error', text: 'Beberapa jabatan tidak dapat dihapus karena sedang dipakai oleh pengurus.' })
      }
    }

    if (!ids.length) {
      setMessage({ type: 'error', text: 'Tidak ada item yang dipilih untuk dihapus.' })
      return
    }

    const label = mode === 'selected' ? 'terpilih' : 'pada tampilan (filter) ini'
    if (!confirm(`Hapus ${ids.length} item ${label} dari ${table}? Tindakan ini tidak dapat dibatalkan.`)) return

    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.from(table).delete().in('id', ids)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: `${ids.length} item berhasil dihapus.` })
      if (target === 'pengurus') setSelectedPengurusIds(new Set())
      else setSelectedStrukturIds(new Set())
      onUpdate()
    } catch (error) {
      console.error(`Bulk delete error (${table}):`, error)
      const msg = error instanceof Error ? error.message : 'Gagal menghapus data.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setPengurusForm(initialPengurusForm)
    setStrukturForm(initialStrukturForm)
    setEditingItem(null)
    setSelectedImageFile(null)
    setImagePreview(null)
    setUploadingImage(false)
  }

  const openModal = (item: Pengurus | StrukturJabatan | null = null) => {
    resetForms()
    if (item) {
      setEditingItem(item)
      if ('nama' in item) { // Pengurus
        setPengurusForm({
          ...initialPengurusForm,
          ...item,
          jabatan_id: item.jabatan_id.toString(),
          instagram: item.instagram || '',
          image_url: item.image_url || '',
          role_type: (item.role_type as 'administrator' | 'member') || 'administrator',
        })
        if (item.image_url) setImagePreview(item.image_url)
      } else { // Struktur
        setStrukturForm({ ...initialStrukturForm, ...item, urutan: item.urutan.toString() })
      }
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(resetForms, 300) // Delay reset for transition
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      const compressedFile = await compressImageToWebP(file, 0.8)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
      const filePath = `pengurus/${fileName}`
      const { error } = await supabase.storage.from('pik-r-bukti').upload(filePath, compressedFile)
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage.from('pik-r-bukti').getPublicUrl(filePath)
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      const msg = error instanceof Error ? error.message : 'Gagal mengupload gambar!'
      setMessage({ type: 'error', text: msg })
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (activeTab === 'pengurus') {
        let imageUrl = editingItem && 'image_url' in editingItem ? editingItem.image_url : ''
        if (selectedImageFile) {
          const uploadedUrl = await uploadImageToSupabase(selectedImageFile)
          if (!uploadedUrl) throw new Error('Gagal mengupload gambar')
          imageUrl = uploadedUrl
        }

        const { nama, jabatan_id, periode } = pengurusForm
        if (!nama?.trim() || !jabatan_id || !periode?.trim()) {
          throw new Error('Nama, Jabatan, dan Periode wajib diisi.')
        }
        const payload = { ...pengurusForm, image_url: imageUrl, jabatan_id: parseInt(jabatan_id) }
        const { error } = editingItem
          ? await supabase.from('pengurus').update(payload).eq('id', editingItem.id)
          : await supabase.from('pengurus').insert(payload)
        if (error) throw new Error(error.message)
      } else {
        const { nama_jabatan, urutan } = strukturForm
        if (!nama_jabatan?.trim() || !urutan?.trim()) {
          throw new Error('Nama Jabatan dan Urutan wajib diisi.')
        }
        const payload = { ...strukturForm, urutan: parseInt(urutan) }
        const { error } = editingItem
          ? await supabase.from('struktur_jabatan').update(payload).eq('id', editingItem.id)
          : await supabase.from('struktur_jabatan').insert(payload)
        if (error) throw new Error(error.message)
      }

      setMessage({ type: 'success', text: `Data berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}!` })
      onUpdate()
      closeModal()
    } catch (error) {
      console.error('Form submission error:', error)
      const msg = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Terjadi kesalahan'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const table = activeTab === 'pengurus' ? 'pengurus' : 'struktur_jabatan'
    if (!confirm(`Apakah Anda yakin ingin menghapus item ini dari ${table}?`)) return

    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Item berhasil dihapus!' })
      onUpdate()
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error)
      const msg = error instanceof Error ? error.message : 'Gagal menghapus item.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'File harus berupa gambar!' })
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB!' })
        return
      }
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const renderTabs = () => (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-6">
        <button onClick={() => setActiveTab('pengurus')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'pengurus' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
          <Users className="h-5 w-5" /> <span>Data Pengurus</span>
        </button>
        <button onClick={() => setActiveTab('struktur')} className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'struktur' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
          <Briefcase className="h-5 w-5" /> <span>Struktur Jabatan</span>
        </button>
      </nav>
    </div>
  )

  const renderPengurusTab = () => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-stretch gap-3 w-full sm:w-auto">
          <div className="relative">
            <select value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)} className="appearance-none w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {periodes.map(p => <option key={p} value={p}>{p === 'all' ? 'Semua Periode' : p}</option>)}
            </select>
            <ChevronsUpDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={selectedRoleType} onChange={e => setSelectedRoleType(e.target.value as 'all' | 'administrator' | 'member')} className="appearance-none w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">Semua Tipe</option>
              <option value="administrator">Administrator</option>
              <option value="member">Member</option>
            </select>
            <ChevronsUpDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <input
            type="text"
            value={searchPengurus}
            onChange={e => setSearchPengurus(e.target.value)}
            placeholder="Cari nama, instagram, jabatan..."
            className="w-full sm:w-64 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm"
          />
          <div className="flex items-center gap-2">
            <button onClick={exportPengurusCSV} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">Export CSV</button>
            <button onClick={exportPengurusXLSX} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">Export XLSX</button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedPengurusIds.size > 0 && (
            <button
              onClick={() => handleBulkDelete('pengurus', 'selected')}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Hapus Terpilih ({selectedPengurusIds.size})
            </button>
          )}
          {false && filteredPengurus.length > 0 && (
            <button
              onClick={() => handleBulkDelete('pengurus', 'all')}
              className="flex items-center px-3 py-2 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-lg hover:bg-red-100 text-sm"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Hapus Semua (Filter)
            </button>
          )}
          <button onClick={() => openModal()} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            <Plus className="w-5 h-5 mr-2" /> Tambah Pengurus
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">
                <input
                  type="checkbox"
                  aria-label="Pilih semua pengurus"
                  checked={filteredPengurus.length > 0 && selectedPengurusIds.size === filteredPengurus.length}
                  onChange={togglePengurusSelectAll}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jabatan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Periode</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPengurus.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${p.nama}`}
                    checked={isPengurusSelected(p.id)}
                    onChange={() => togglePengurusSelect(p.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={p.image_url || `https://ui-avatars.com/api/?name=${p.nama}&background=random`}
                        alt={p.nama}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{p.nama}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{p.instagram}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{strukturJabatan.find(j => j.id === p.jabatan_id)?.nama_jabatan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.periode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openModal(p)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Edit className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderStrukturTab = () => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl">
       <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={searchStruktur}
          onChange={e => setSearchStruktur(e.target.value)}
          placeholder="Cari nama jabatan..."
          className="w-full sm:w-72 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedStrukturIds.size > 0 && (
            <button
              onClick={() => handleBulkDelete('struktur', 'selected')}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Hapus Terpilih ({selectedStrukturIds.size})
            </button>
          )}
          <button onClick={() => openModal()} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            <Plus className="w-5 h-5 mr-2" /> Tambah Jabatan
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">
                <input
                  type="checkbox"
                  aria-label="Pilih semua jabatan"
                  checked={filteredStruktur.length > 0 && selectedStrukturIds.size === filteredStruktur.length}
                  onChange={toggleStrukturSelectAll}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Jabatan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Urutan</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStruktur.sort((a, b) => a.urutan - b.urutan).map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    aria-label={`Pilih jabatan ${s.nama_jabatan}`}
                    checked={isStrukturSelected(s.id)}
                    onChange={() => toggleStrukturSelect(s.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.nama_jabatan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.urutan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openModal(s)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Edit className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(s.id)} disabled={pengurus.some(p => p.jabatan_id === s.id)} className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:text-gray-400 disabled:cursor-not-allowed"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Removed bottom bulk actions to keep UI consistent with Pengurus toolbar */}
    </div>
  )

  const renderModal = () => (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {editingItem ? `Edit ${activeTab === 'pengurus' ? 'Pengurus' : 'Jabatan'}` : `Tambah ${activeTab === 'pengurus' ? 'Pengurus' : 'Jabatan'}`}
                </Dialog.Title>
                <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                  {activeTab === 'pengurus' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                          <input type="text" value={pengurusForm.nama} onChange={e => setPengurusForm({...pengurusForm, nama: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jabatan</label>
                          <select value={pengurusForm.jabatan_id} onChange={e => setPengurusForm({...pengurusForm, jabatan_id: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required>
                            <option value="">Pilih Jabatan</option>
                            {strukturJabatan.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Periode</label>
                          <input type="text" value={pengurusForm.periode} onChange={e => setPengurusForm({...pengurusForm, periode: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe</label>
                          <select value={pengurusForm.role_type} onChange={e => setPengurusForm({...pengurusForm, role_type: e.target.value as 'administrator' | 'member'})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required>
                            <option value="administrator">Administrator (Ditampilkan)</option>
                            <option value="member">Member (Tidak ditampilkan)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instagram (opsional)</label>
                          <input type="text" value={pengurusForm.instagram} onChange={e => setPengurusForm({...pengurusForm, instagram: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Pengurus</label>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <User className="h-12 w-12 text-gray-400" />
                            )}
                          </div>
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <span>{uploadingImage ? 'Mengupload...' : 'Pilih Gambar'}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageFileSelect} accept="image/*" disabled={uploadingImage} />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Jabatan</label>
                          <input type="text" value={strukturForm.nama_jabatan} onChange={e => setStrukturForm({...strukturForm, nama_jabatan: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Urutan</label>
                          <input type="number" value={strukturForm.urutan} onChange={e => setStrukturForm({...strukturForm, urutan: e.target.value})} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                      Batal
                    </button>
                    <button type="submit" disabled={loading || uploadingImage} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center">
                      {loading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2"/>Simpan</>}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-2xl shadow-lg">
      {message && (
        <div className={`p-4 rounded-lg text-sm mb-4 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-2 flex items-center gap-3">
        <AdminLogo size="sm" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pengurus & Jabatan</h2>
      </div>

      {renderTabs()}

      <div className="mt-6">
        {activeTab === 'pengurus' ? renderPengurusTab() : renderStrukturTab()}
      </div>
      
      {renderModal()}
    </div>
  )
}
