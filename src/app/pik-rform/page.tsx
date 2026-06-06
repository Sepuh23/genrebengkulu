'use client'

import { useState, useEffect } from 'react'
import { supabase, type FormControl } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { PikRForm } from '@/components/PikRForm'
import { FileText, Clock, AlertTriangle } from 'lucide-react'

export default function PikRFormPage() {
  const [formControl, setFormControl] = useState<FormControl | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFormControl()
  }, [])

  const fetchFormControl = async () => {
    try {
      const { data: formControlData } = await supabase
        .from('form_control')
        .select('*')
        .single()

      setFormControl(formControlData)
    } catch (error) {
      console.error('Error fetching form control:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFormOpen = () => {
    if (!formControl) return false
    const now = new Date()
    const buka = formControl.buka ? new Date(formControl.buka) : null
    const tutup = formControl.tutup ? new Date(formControl.tutup) : null
    
    return (!buka || now >= buka) && (!tutup || now <= tutup)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tidak ditentukan'
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-600 to-blue-700 dark:from-green-800 dark:to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Form Pendataan PIK-R
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Bergabunglah dengan Pusat Informasi dan Konseling Remaja untuk mendapatkan akses ke berbagai program dan layanan
          </p>
        </div>
      </section>

      {/* Form Status Section */}
      {formControl && (
        <section className="py-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`rounded-lg p-6 ${
              isFormOpen() 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isFormOpen() ? (
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-semibold ${
                    isFormOpen() 
                      ? 'text-green-800 dark:text-green-300' 
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {isFormOpen() ? 'Formulir Terbuka' : 'Formulir Ditutup'}
                  </h3>
                  <div className={`mt-1 text-sm ${
                    isFormOpen() 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Dibuka: {formatDate(formControl.buka)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Ditutup: {formatDate(formControl.tutup)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Form Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isFormOpen() ? (
            <div>
              {/* Form Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4">
                  Petunjuk Pengisian Form
                </h2>
                <div className="space-y-2 text-blue-700 dark:text-blue-400">
                  <p>• Pastikan semua data yang diisi adalah benar dan valid</p>
                  <p>• Semua field bertanda (*) wajib diisi</p>
                  <p>• Upload bukti screenshot dengan format gambar (JPG, PNG, WebP)</p>
                  <p>• Maksimal ukuran file adalah 5MB</p>
                  <p>• Pastikan nomor telepon dan email aktif untuk komunikasi selanjutnya</p>
                </div>
              </div>

              {/* PIK-R Form Component */}
              <PikRForm />
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Formulir Pendataan Ditutup
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Formulir Pendataan PIK-R saat ini sedang ditutup. Silakan periksa jadwal pembukaan 
                atau hubungi admin untuk informasi lebih lanjut.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
