'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, AlertCircle, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { compressImageToWebP, validateEmail, validatePhone } from '@/lib/image-utils'
import Image from 'next/image'

interface FormData {
  nama: string
  ttl: string
  asal_pikr: string
  alamat_lengkap: string
  tlpn: string
  email: string
  jabatan_pikr: string
  bukti_ss: File | null
}

export function PikRForm() {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    ttl: '',
    asal_pikr: '',
    alamat_lengkap: '',
    tlpn: '',
    email: '',
    jabatan_pikr: '',
    bukti_ss: null
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, bukti_ss: file }))
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.nama.trim()) errors.push('Nama wajib diisi')
    if (!formData.asal_pikr.trim()) errors.push('Asal PIK-R wajib diisi')
    if (!formData.alamat_lengkap.trim()) errors.push('Alamat lengkap wajib diisi')
    if (!formData.jabatan_pikr.trim()) errors.push('Jabatan PIK-R wajib diisi')
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.push('Format email tidak valid')
    }
    
    if (formData.tlpn && !validatePhone(formData.tlpn)) {
      errors.push('Format nomor telepon tidak valid')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      let buktiUrl = null

      // Upload and compress image if provided
      if (formData.bukti_ss) {
        try {
          const compressedFile = await compressImageToWebP(formData.bukti_ss, 0.7)
          
          const fileName = `bukti-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
          const { error: uploadError } = await supabase.storage
            .from('pik-r-bukti')
            .upload(fileName, compressedFile)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            // If bucket doesn't exist, continue without file upload
            if (uploadError.message.includes('Bucket not found')) {
              setMessage({ 
                type: 'error', 
                text: 'Storage bucket belum dikonfigurasi. Formulir akan dikirim tanpa bukti file. Hubungi administrator.' 
              })
              buktiUrl = null
            } else {
              throw uploadError
            }
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('pik-r-bukti')
              .getPublicUrl(fileName)
            
            buktiUrl = publicUrl
          }
        } catch (compressionError) {
          console.error('Image compression error:', compressionError)
          setMessage({ 
            type: 'error', 
            text: 'Gagal memproses gambar. Silakan coba dengan file yang berbeda.' 
          })
          return
        }
      }

      // Submit form data
      const { error: submitError } = await supabase
        .from('pik_r_submissions')
        .insert({
          nama: formData.nama,
          ttl: formData.ttl || null,
          asal_pikr: formData.asal_pikr,
          alamat_lengkap: formData.alamat_lengkap,
          tlpn: formData.tlpn || null,
          email: formData.email || null,
          jabatan_pikr: formData.jabatan_pikr,
          bukti_ss: buktiUrl
        })

      if (submitError) throw submitError

      setMessage({ type: 'success', text: 'Formulir berhasil dikirim!' })
      
      // Reset form
      setFormData({
        nama: '',
        ttl: '',
        asal_pikr: '',
        alamat_lengkap: '',
        tlpn: '',
        email: '',
        jabatan_pikr: '',
        bukti_ss: null
      })
      setFilePreview(null)

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Error submitting form:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengirim formulir' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-5 md:p-8">
        {/* Header */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Formulir Pendataan PIK-R
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Isi formulir berikut untuk Pendataan anggota PIK-R Se-Kota Bengkulu
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-900/50' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                Tempat, Tanggal Lahir
              </label>
              <input
                type="text"
                id="ttl"
                name="ttl"
                value={formData.ttl}
                onChange={handleInputChange}
                placeholder="Contoh: Bengkulu, 01 Januari 2000"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="asal_pikr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                Asal PIK-R/PIK-M <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="asal_pikr"
                name="asal_pikr"
                value={formData.asal_pikr}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="alamat_lengkap" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="alamat_lengkap"
                name="alamat_lengkap"
                value={formData.alamat_lengkap}
                onChange={handleInputChange}
                placeholder="Contoh: Jl. Melati No. 12, RT 01/RW 02, Kel. Kebun Bunga, Kec. Selebar, Kota Bengkulu, Bengkulu"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="tlpn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="tlpn"
                name="tlpn"
                value={formData.tlpn}
                onChange={handleInputChange}
                placeholder="Contoh: 08123456789"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Contoh: nama@email.com"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Position Information */}
          <div>
            <label htmlFor="jabatan_pikr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
              Jabatan di PIK-R/PIK-M <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jabatan_pikr"
              name="jabatan_pikr"
              value={formData.jabatan_pikr}
              onChange={handleInputChange}
              placeholder="Contoh: Ketua, Sekretaris, Bendahara"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="bukti_ss" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
              Bukti Screenshot
            </label>
            
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  id="bukti_ss"
                  name="bukti_ss"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-red-500 dark:hover:border-red-400 transition-colors duration-200 cursor-pointer">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.bukti_ss ? formData.bukti_ss.name : 'Klik untuk mengunggah file'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Format: JPG, PNG, WEBP (Maks. 5MB)
                    </p>
                  </div>
                </div>
              </div>
              
              {filePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pratinjau:</p>
                  <Image
                    src={filePreview}
                    alt="Pratinjau bukti"
                    width={400}
                    height={300}
                    unoptimized
                    className="max-h-40 rounded-lg object-cover w-full border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Bukti Screenshot bisa dilihat oleh admin, jadi pastikan file yang dikirim valid.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-7 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </span>
              ) : (
                'Kirim Formulir'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}