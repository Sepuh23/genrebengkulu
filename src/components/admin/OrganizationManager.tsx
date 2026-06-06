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

export default function OrganizationManager({ pengurus, strukturJabatan, onUpdate }: OrganizationManagerProps) {
  const [activeTab, setActiveTab] = useState<'pengurus' | 'struktur'>('pengurus')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Pengurus | StrukturJabatan | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPeriode, setSelectedPeriode] = useState<string>('all')
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

  const buildPengurusRows = () => {
    const header = ['ID', 'Nama', 'Jabatan', 'Instagram', 'Periode', 'Tipe']
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
    const csvContent = '\ufeff' + csvLines.join('\n')
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

  const handleBulkDelete = async (target: 'pengurus' | 'struktur', mode: 'selected' | 'all') => {
    const table = target === 'pengurus' ? 'pengurus' : 'struktur_jabatan'
    let ids: number[] = []
    if (target === 'pengurus') {
      ids = mode === 'selected' ? Array.from(selectedPengurusIds) : filteredPengurus.map(p => p.id)
    } else {
      const rawIds = mode === 'selected' ? Array.from(selectedStrukturIds) : filteredStruktur.map(s => s.id)
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
    if (!confirm(`Hapus ${ids.length} item ${label} dari ${table}?`)) return
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
      if ('nama' in item) {
        setPengurusForm({
          ...initialPengurusForm,
          ...item,
          jabatan_id: item.jabatan_id?.toString() ?? '',
          instagram: item.instagram ?? '',
          image_url: item.image_url ?? '',
          role_type: (item.role_type === 'administrator' || item.role_type === 'member') ? item.role_type : 'administrator',
        })
        if (item.image_url) setImagePreview(item.image_url)
      } else {
        setStrukturForm({ ...initialStrukturForm, ...item, urutan: item.urutan?.toString() ?? '' })
      }
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(resetForms, 300)
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
        if (!nama?.trim()) throw new Error('Nama wajib diisi.')
        if (!jabatan_id) throw new Error('Jabatan wajib dipilih.')
        if (!periode?.trim()) throw new Error('Periode wajib diisi.')
        const jabatanIdNum = parseInt(jabatan_id)
        if (isNaN(jabatanIdNum)) throw new Error('ID Jabatan tidak valid')
        const payload = { ...pengurusForm, image_url: imageUrl, jabatan_id: jabatanIdNum }
        const { error } = editingItem
          ? await supabase.from('pengurus').update(payload).eq('id', editingItem.id)
          : await supabase.from('pengurus').insert(payload)
        if (error) throw new Error(error.message)
      } else {
        const { nama_jabatan, urutan } = strukturForm
        if (!nama_jabatan?.trim()) throw new Error('Nama Jabatan wajib diisi.')
        if (!urutan?.trim()) throw new Error('Urutan wajib diisi.')
        const urutanNum = parseInt(urutan)
        if (isNaN(urutanNum)) throw new Error('Urutan harus berupa angka')
        const payload = { nama_jabatan, urutan: urutanNum }
        const { error } = editingItem
          ? await supabase.from('struktur_jabatan').update(payload).eq('id', editingItem.id)
          : await supabase.from('struktur_jabatan').insert(payload)
        if (error) throw new Error(error.message)
      }
      setMessage({ type: 'success', text: `Data berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}!` })
      onUpdate()
      closeModal()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Terjadi kesalahan'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const table = activeTab === 'pengurus' ? 'pengurus' : 'struktur_jabatan'
    if (!confirm(`Apakah Anda yakin ingin menghapus item ini?`)) return
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Item berhasil dihapus!' })
      onUpdate()
    } catch (error) {
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
      if (file.size > 5 * 1024 * 1024) {
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
        <button onClick={() => setActiveTab('pengurus')} className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'pengurus' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'}`}>
          <Users className="h-5 w-5" /> <span>Data Pengurus</span>
        </button>
        <button onClick={() => setActiveTab('struktur')} className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'struktur' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'}`}>
          <Briefcase className="h-5 w-5" /> <span>Struktur Jabatan</span>
        </button>
      </nav>
    </div>
  )

  const renderPengurusTab = () => (
    <div className="bg-white shadow-md rounded-xl">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex gap-3">
          <select value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)} className="px-3 py-2 border rounded-md">
            {periodes.map(p => <option key={p} value={p}>{p === 'all' ? 'Semua Periode' : p}</option>)}
          </select>
          <select value={selectedRoleType} onChange={e => setSelectedRoleType(e.target.value as any)} className="px-3 py-2 border rounded-md">
            <option value="all">Semua Tipe</option>
            <option value="administrator">Administrator</option>
            <option value="member">Member</option>
          </select>
          <input type="text" value={searchPengurus} onChange={e => setSearchPengurus(e.target.value)} placeholder="Cari..." className="px-3 py-2 border rounded-md w-64" />
          <button onClick={exportPengurusCSV} className="px-3 py-2 border rounded-md">CSV</button>
          <button onClick={exportPengurusXLSX} className="px-3 py-2 border rounded-md">Excel</button>
        </div>
        <div className="flex gap-2">
          {selectedPengurusIds.size > 0 && (
            <button onClick={() => handleBulkDelete('pengurus', 'selected')} className="px-3 py-2 bg-red-600 text-white rounded-md">Hapus ({selectedPengurusIds.size})</button>
          )}
          <button onClick={() => openModal()} className="px-4 py-2 bg-red-600 text-white rounded-md">+ Tambah</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2"><input type="checkbox" onChange={togglePengurusSelectAll} /></th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Jabatan</th>
              <th className="px-4 py-2 text-left">Periode</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPengurus.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2"><input type="checkbox" checked={isPengurusSelected(p.id)} onChange={() => togglePengurusSelect(p.id)} /></td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Image src={p.image_url || `https://ui-avatars.com/api/?name=${p.nama}`} alt={p.nama} width={32} height={32} className="rounded-full" />
                    <span>{p.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-2">{strukturJabatan.find(j => j.id === p.jabatan_id)?.nama_jabatan}</td>
                <td className="px-4 py-2">{p.periode}</td>
                <td className="px-4 py-2">
                  <button onClick={() => openModal(p)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderStrukturTab = () => (
    <div className="bg-white shadow-md rounded-xl">
      <div className="p-4 flex justify-between items-center border-b">
        <input type="text" value={searchStruktur} onChange={e => setSearchStruktur(e.target.value)} placeholder="Cari jabatan..." className="px-3 py-2 border rounded-md w-64" />
        <div className="flex gap-2">
          {selectedStrukturIds.size > 0 && (
            <button onClick={() => handleBulkDelete('struktur', 'selected')} className="px-3 py-2 bg-red-600 text-white rounded-md">Hapus ({selectedStrukturIds.size})</button>
          )}
          <button onClick={() => openModal()} className="px-4 py-2 bg-red-600 text-white rounded-md">+ Tambah Jabatan</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2"><input type="checkbox" onChange={toggleStrukturSelectAll} /></th>
              <th className="px-4 py-2 text-left">Nama Jabatan</th>
              <th className="px-4 py-2 text-left">Urutan</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStruktur.sort((a, b) => a.urutan - b.urutan).map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2"><input type="checkbox" checked={isStrukturSelected(s.id)} onChange={() => toggleStrukturSelect(s.id)} /></td>
                <td className="px-4 py-2">{s.nama_jabatan}</td>
                <td className="px-4 py-2">{s.urutan}</td>
                <td className="px-4 py-2">
                  <button onClick={() => openModal(s)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderModal = () => (
    <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full">
          <Dialog.Title className="text-lg font-bold mb-4">{editingItem ? 'Edit' : 'Tambah'} {activeTab === 'pengurus' ? 'Pengurus' : 'Jabatan'}</Dialog.Title>
          <form onSubmit={handleFormSubmit}>
            {activeTab === 'pengurus' ? (
              <div className="space-y-3">
                <input type="text" value={pengurusForm.nama} onChange={e => setPengurusForm({...pengurusForm, nama: e.target.value})} placeholder="Nama" className="w-full p-2 border rounded-md" required />
                <select value={pengurusForm.jabatan_id} onChange={e => setPengurusForm({...pengurusForm, jabatan_id: e.target.value})} className="w-full p-2 border rounded-md" required>
                  <option value="">Pilih Jabatan</option>
                  {strukturJabatan.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan}</option>)}
                </select>
                <input type="text" value={pengurusForm.periode} onChange={e => setPengurusForm({...pengurusForm, periode: e.target.value})} placeholder="Periode" className="w-full p-2 border rounded-md" required />
                <input type="text" value={pengurusForm.instagram} onChange={e => setPengurusForm({...pengurusForm, instagram: e.target.value})} placeholder="Instagram" className="w-full p-2 border rounded-md" />
                <input type="file" onChange={handleImageFileSelect} accept="image/*" />
              </div>
            ) : (
              <div className="space-y-3">
                <input type="text" value={strukturForm.nama_jabatan} onChange={e => setStrukturForm({...strukturForm, nama_jabatan: e.target.value})} placeholder="Nama Jabatan" className="w-full p-2 border rounded-md" required />
                <input type="number" value={strukturForm.urutan} onChange={e => setStrukturForm({...strukturForm, urutan: e.target.value})} placeholder="Urutan" className="w-full p-2 border rounded-md" required />
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Batal</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md">Simpan</button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      {message && (
        <div className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <AdminLogo size="sm" />
        <h2 className="text-xl font-semibold">Pengurus & Jabatan</h2>
      </div>
      {renderTabs()}
      <div className="mt-4">
        {activeTab === 'pengurus' ? renderPengurusTab() : renderStrukturTab()}
      </div>
      {renderModal()}
    </div>
  )
}