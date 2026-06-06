'use client'

import Link from 'next/link'
import { MapPin, Phone, Instagram, MailIcon } from 'lucide-react'
import Image from 'next/image'
import { assets } from '@/assets/assets'

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-1  mb-4">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Image
                  src={assets.genre_bengkulu_logo}
                  alt="Logo Genbi Kota Bengkulu"
                  className="opacity-90"
                  priority
                />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                GenRe Kota Bengkulu
              </span>
            </Link>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
            Genre adalah salah satu organisasi yang berfokus membantu remaja merencanakan masa depannya sehingga dapat mewujudkan mimpi Indonesia Emas 2045. Genre Kota Bengkulu telah berkontribusi aktif dalam membantu dan hadir di tengah-tengah remaja Kota Bengkulu melalui Pusat Informasi Konseling Remaja (PIK-R) yang keberadaannya tersebar di berbagai sekolah (SMP/SMA/Pereguruan Tinggi) dan masyarakat.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/genrebengkulu_official
/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50/60 dark:hover:bg-pink-900/20 transition-colors"
                aria-label="Instagram GenRe Bengkulu Official"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm">GenRe Bengkulu Official</span>
              </a>
              <a
                href="https://www.instagram.com/genrekotabengkulu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50/60 dark:hover:bg-pink-900/20 transition-colors"
                aria-label="Instagram GenRe Kota Bengkulu"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm">GenRe Kota Bengkulu</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Navigasi</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/pengurus', label: 'Pengurus' },
                { href: '/duta-genre', label: 'Duta Genre' },
                { href: '/kegiatans', label: 'Kegiatan' },
                { href: '/pik-rform', label: 'Pik-R Form' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/Wa4TzNbD6bYFrJmD8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 hover:underline"
                  aria-label="Hubungi via WhatsApp +62 812-8888-8888"
                >
                  Jl. Musium No.6, Jemb. Kecil, Kec. Singaran Pati, Kota Bengkulu, 38224 (DP3AP2KB)
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <a
                  href="https://wa.me/6283157664115"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 hover:underline"
                  aria-label="Hubungi via WhatsApp +62 812-8888-8888"
                >
                  Nabila Putri Rasya
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <a
                  href="mailto:forumgenrekotabengkulu@gmail.com"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 hover:underline"
                  aria-label="Kirim email ke forumgenrekotabengkulu@gmail.com"
                >
                  forumgenrekotabengkulu@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 text-sm text-center md:text-left px-2">
              <span>© 2025 GenRe Kota Bengkulu.</span>
              <span>Salam GenRe!</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 text-sm px-2">
              <Link 
                href="https://github.com/RayanKhairullah" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                create by rayan4k
              </Link>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <div className="flex items-center space-x-2">
                <a 
                  href="https://www.instagram.com/rayankhairullah/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}