'use client'

import Link from 'next/link'
import { ArrowRight, Users, FileText, Target, Award } from 'lucide-react'

const QuickLinksSection: React.FC = () => {
  const quickLinks = [
    {
      href: "/pengurus",
      // Organization/people: indigo
      icon: <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Pengurus Forum",
      desc: "Lihat struktur organisasi Forum GenRe Kota Bengkulu dan profil pengurus",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      href: "/pik-rform",
      // Forms/data: emerald
      icon: <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      title: "Form Pendataan PIK-R",
      desc: "Datakan diri untuk bergabung dengan program PIK-R",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      href: "/duta-genre",
      // Awards: amber (gold-like)
      icon: <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      title: "Duta Genre",
      desc: "Informasi dan profil Duta Genre Kota Bengkulu",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      href: "/kegiatans",
      // Activities/targets: orange
      icon: <Target className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
      title: "Kegiatan",
      desc: "Jelajahi kegiatan Forum GenRe Kota Bengkulu",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium mb-6">
            💬 Akses Cepat
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Akses Cepat
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Bingung Mau Akses Apa? Berikut Beberapa Pintasan Pilihan Untukmu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="group relative bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 ${link.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                {link.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {link.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                {link.desc}
              </p>
              <div className="absolute top-6 right-6 w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center group-hover:bg-red-600 dark:group-hover:bg-red-500 transition-colors duration-200">
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuickLinksSection
