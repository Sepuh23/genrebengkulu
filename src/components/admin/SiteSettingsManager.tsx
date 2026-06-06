'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface SiteSettings {
  id: boolean
  bg_type: 'color' | 'image'
  bg_color: string
  bg_image_url: string | null
  updated_at: string
}

interface Props {
  settings: SiteSettings | null
  onUpdate: () => void
}

const BUCKET = 'pik-r-bukti'

export function SiteSettingsManager({ settings, onUpdate }: Props) {
  const [bgType, setBgType] = useState<'color' | 'image'>(settings?.bg_type ?? 'color')
  const [bgColor, setBgColor] = useState(settings?.bg_color ?? '#ffffff')
  const [bgImageUrl, setBgImageUrl] = useState(settings?.bg_image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    setUploading(true)
    setMsg(null)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `site-bg/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })
      if (error) throw error
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      setBgImageUrl(pub.publicUrl)
      setMsg({ type: 'success', text: 'Gambar berhasil diupload!' })
    } catch (e) {
      setMsg({ type: 'error', text: 'Gagal upload gambar: ' + (e instanceof Error ? e.message : 'Unknown error') })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const { error } = await supabase.from('site_settings').upsert({
        id: true,
        bg_type: bgType,
        bg_color: bgColor,
        bg_image_url: bgImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      setMsg({ type: 'success', text: 'Pengaturan berhasil disimpan!' })
      onUpdate()
    } catch (e) {
      setMsg({ type: 'error', text: 'Gagal menyimpan: ' + (e instanceof Error ? e.message : 'Unknown error') })
    } finally {
      setSaving(false)
    }
  }

  const previewBg =
    bgType === 'color'
      ? { backgroundColor: bgColor }
      : bgImageUrl
      ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: '#e5e7eb' }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pengaturan Tampilan</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Atur background halaman utama situs publik.
        </p>
      </div>

      {msg && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Preview Background</span>
        </div>
        <div className="h-40 w-full flex items-center justify-center" style={previewBg}>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
            Halaman Utama
          </span>
        </div>
      </div>

      {/* Tipe Background */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe Background</label>
        <div className="flex gap-3">
          <button
            onClick={() => setBgType('color')}
            className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
              bgType === 'color'
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            🎨 Warna
          </button>
          <button
            onClick={() => setBgType('image')}
            className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
              bgType === 'image'
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            🖼️ Gambar
          </button>
        </div>
      </div>

      {/* Color Picker */}
      {bgType === 'color' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Warna</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-12 w-20 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-1 bg-white dark:bg-gray-800"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="#ffffff"
            />
          </div>
          {/* Preset warna */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Preset warna:</span>
            <div className="flex flex-wrap gap-2">
              {[
                '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
                '#fef2f2', '#fff7ed', '#fefce8', '#f0fdf4',
                '#eff6ff', '#f5f3ff', '#1e293b', '#0f172a',
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  title={c}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                    bgColor === c ? 'border-red-500 scale-110' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Upload */}
      {bgType === 'image' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Gambar Background</label>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadImage(file)
            }}
          />

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Mengupload...
              </span>
            ) : (
              <span className="flex flex-col items-center gap-1">
                <span className="text-2xl">📁</span>
                <span className="text-sm font-medium">Klik untuk pilih gambar</span>
                <span className="text-xs">JPG, PNG, WebP — Maks 5MB</span>
              </span>
            )}
          </button>

          {bgImageUrl && (
            <div className="space-y-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">URL Gambar:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bgImageUrl}
                  onChange={(e) => setBgImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setBgImageUrl('')}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tombol Simpan */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Menyimpan...
            </>
          ) : (
            '💾 Simpan Pengaturan'
          )}
        </button>
      </div>
    </div>
  )
}