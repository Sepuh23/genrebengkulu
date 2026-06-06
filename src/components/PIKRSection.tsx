'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

const PIKRSection: React.FC = () => {
  const services = [
    {
      title: "Konseling",
      description: "Layanan konseling untuk remaja tentang kesehatan reproduksi dan perencanaan hidup."
    },
    {
      title: "Edukasi",
      description: "Program edukasi tentang kehidupan berkeluarga, kesehatan, dan keterampilan hidup."
    },
    {
      title: "Pemberdayaan",
      description: "Kegiatan pemberdayaan remaja melalui berbagai program pengembangan diri."
    }
  ]

  return (
    <section className="py-16 dark:bg-gray-800" id="pik-r">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium mb-6">
            💬 PIK-R
          </div>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            PIK-R (Pusat Informasi dan Konseling Remaja)
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            PIK-R adalah wadah kegiatan program GenRe yang dikelola dari, oleh, dan untuk remaja 
            guna memberikan pelayanan informasi dan konseling tentang perencanaan kehidupan berkeluarga.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Layanan PIK-R
            </h3>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-gray-100 dark:from-red-900/20 dark:to-gray-900/20 rounded-2xl p-8">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Bergabung dengan PIK-R
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Daftarkan diri Anda untuk menjadi bagian dari PIK-R dan dapatkan akses ke berbagai program dan layanan yang tersedia.
              </p>
              <Link
                href="/pik-rform"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 inline-flex items-center"
              >
                Datakan Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PIKRSection
