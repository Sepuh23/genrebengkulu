'use client'

import { useState } from 'react'
import { supabase, type FormControl } from '@/lib/supabase'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { CheckCircle, XCircle, Calendar, Clock, Save, PowerOff } from 'lucide-react'

interface FormControlManagerProps {
  formControl: FormControl | null
  onUpdate: () => void
}

export function FormControlManager({ formControl, onUpdate }: FormControlManagerProps) {
  const [buka, setBuka] = useState(formControl?.buka ? new Date(formControl.buka).toISOString().slice(0, 16) : '')
  const [tutup, setTutup] = useState(formControl?.tutup ? new Date(formControl.tutup).toISOString().slice(0, 16) : '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const updateData = {
        buka: buka ? new Date(buka).toISOString() : null,
        tutup: tutup ? new Date(tutup).toISOString() : null,
      }

      // Ensure we always target the singleton row (id=1 by convention if absent)
      const targetId = formControl?.id ?? true
      const { error } = await supabase.from('form_control').upsert({ id: targetId, ...updateData })
      if (error) throw new Error(error.message)

      setMessage({ type: 'success', text: 'Pengaturan formulir berhasil diperbarui!' })
      onUpdate()
    } catch (error) {
      console.error('Error updating form control:', error)
      const msg = error instanceof Error ? error.message : 'Gagal memperbarui pengaturan formulir'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (duration: '24h' | '7d' | '30d') => {
    const now = new Date()
    const endTime = new Date(now.getTime())

    if (duration === '24h') endTime.setDate(now.getDate() + 1)
    if (duration === '7d') endTime.setDate(now.getDate() + 7)
    if (duration === '30d') endTime.setDate(now.getDate() + 30)

    setBuka(now.toISOString().slice(0, 16))
    setTutup(endTime.toISOString().slice(0, 16))
  }

  const handleCloseForm = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const targetId = formControl?.id ?? true
      const { error } = await supabase.from('form_control').upsert({ id: targetId, buka: null, tutup: new Date().toISOString() })
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Formulir berhasil ditutup!' })
      setBuka('')
      setTutup(new Date().toISOString().slice(0, 16))
      onUpdate()
    } catch (error) {
      console.error('Error closing form:', error)
      const msg = error instanceof Error ? error.message : 'Gagal menutup formulir'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const isFormOpen = formControl?.buka && formControl?.tutup && new Date() >= new Date(formControl.buka) && new Date() <= new Date(formControl.tutup)

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <AdminLogo size="sm" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kontrol Formulir</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Atur jadwal ketersediaan formulir Pendataan PIK-R untuk publik.</p>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${isFormOpen ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isFormOpen ? <CheckCircle className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
          </div>
          <div className="ml-4">
            <h3 className={`text-lg font-semibold ${isFormOpen ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
              Status: {isFormOpen ? 'Formulir Aktif' : 'Formulir Tutup'}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formControl?.buka && formControl?.tutup ? (
                <span>Periode: {new Date(formControl.buka).toLocaleString('id-ID')} - {new Date(formControl.tutup).toLocaleString('id-ID')}</span>
              ) : (
                <span>Jadwal belum diatur.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Atur Jadwal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="buka" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu Buka</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input type="datetime-local" id="buka" value={buka} onChange={(e) => setBuka(e.target.value)} className="block w-full pl-10 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label htmlFor="tutup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu Tutup</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input type="datetime-local" id="tutup" value={tutup} onChange={(e) => setTutup(e.target.value)} className="block w-full pl-10 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aksi Cepat</h4>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleQuickAction('24h')} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Clock className="w-4 h-4"/><span>Buka 24 Jam</span></button>
              <button type="button" onClick={() => handleQuickAction('7d')} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Clock className="w-4 h-4"/><span>Buka 1 Minggu</span></button>
              <button type="button" onClick={() => handleQuickAction('30d')} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><Clock className="w-4 h-4"/><span>Buka 1 Bulan</span></button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleCloseForm} disabled={loading} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              <PowerOff className="w-4 h-4 mr-2" />
              Tutup Formulir
            </button>
            <button type="submit" disabled={loading} className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
