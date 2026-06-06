'use client'

import Image from 'next/image'
import { useState } from 'react'
import { assets } from '@/assets/assets'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: React.ReactNode
}

const FAQAccordion: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'Apa itu Duta GenRe?',
      answer:
        'Duta Generasi Berencana (Duta GenRe) adalah perwakilan remaja yang menjadi role model, edukator sebaya, dan komunikator program GenRe/BKKBN. Mereka mengampanyekan perilaku berencana: menunda usia pernikahan, merencanakan pendidikan/karier, serta menyiapkan kehidupan berkeluarga yang sehat dan berkualitas.'
    },
    {
      id: 2,
      question: 'Apa tugas utama Duta GenRe?',
      answer:
        'Tugasnya meliputi edukasi dan konseling sebaya tentang kesehatan reproduksi remaja (KRR), pencegahan pernikahan anak, pencegahan tiga risiko remaja (TRIAD KRR), promosi perencanaan pendidikan/karier, serta menjadi jembatan informasi program BKKBN di sekolah, kampus, dan komunitas.'
    },
    {
      id: 3,
      question: 'Siapa yang bisa menjadi Duta GenRe?',
      answer:
        'Remaja dan pemuda yang berkomitmen pada nilai GenRe, biasanya berusia 16–22 tahun (mengacu pada ajang pemilihan daerah). Kategori umumnya mencakup Pelajar/Remaja (SMA/SMK sederajat) dan Mahasiswa/Umum, dengan ketentuan spesifik mengikuti kebijakan panitia daerah.'
    },
    {
      id: 4,
      question: 'Apa kriteria penilaian Duta GenRe?',
      answer:
        'Kriteria umum: pengetahuan GenRe dan program BKKBN, kemampuan public speaking dan advokasi, kepribadian dan etika digital, proyek sosial atau inisiatif pengabdian, serta jejak peran aktif di PIK R/M atau komunitas remaja.'
    },
    {
      id: 5,
      question: 'Apa manfaat menjadi Duta GenRe?',
      answer:
        'Pengembangan kepemimpinan dan jejaring, peningkatan kemampuan komunikasi dan manajemen proyek, peluang kolaborasi dengan pemerintah/mitra, serta kontribusi nyata pada isu remaja dan keluarga berencana di daerah.'
    },
    {
      id: 6,
      question: 'Bagaimana alur pemilihan Duta GenRe?',
      answer:
        'Umumnya dimulai dari seleksi berkas, wawancara dan uji pengetahuan, penilaian proyek/program kerja, karantina dan pembekalan, hingga malam puncak penobatan. Pemenang menjadi duta/role model di tingkat sekolah/kampus, kecamatan, kota/kabupaten, hingga provinsi dan nasional.'
    },
    {
      id: 7,
      question: 'Apa peran Duta GenRe setelah terpilih?',
      answer:
        'Menjalankan program kerja periode berjalan (misalnya 1 tahun), membuat kampanye edukasi online/offline, kolaborasi dengan PIK R, sekolah/kampus, dan OPD terkait, serta menjadi Public Relation (PR) program GenRe/KB di wilayahnya.'
    },
    {
      id: 8,
      question: 'Bagaimana cara ikut serta atau mendapatkan info terbaru?',
      answer:
        'Ikuti informasi resmi BKKBN/DP3AP2KB setempat, akun GenRe provinsi/kabupaten/kota, serta PIK R/M di sekolah atau kampus. Persiapkan pengetahuan GenRe, latih public speaking, dan buat portofolio proyek sosial yang relevan.'
    }
  ]

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id)
  }

  return (
    <div className="space-y-3">
      {faqData.map((item) => {
        const isOpen = openItem === item.id
        return (
          <div
            key={item.id}
            className={`bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-lg dark:hover:shadow-2xl ${
              isOpen ? 'shadow-xl dark:shadow-2xl ring-1 ring-red-500/20' : 'hover:border-gray-300/50 dark:hover:border-gray-600/50'
            }`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-5 text-left flex justify-between items-center group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-300"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
            >
              <span className="font-semibold text-gray-900 dark:text-white text-lg transition-colors duration-300 group-hover:text-red-600 dark:group-hover:text-red-400 pr-4">
                {item.question}
              </span>
              <span className={`transition-all duration-500 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isOpen
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400'
                  }`}
                />
              </span>
            </button>

            <div
              id={`faq-answer-${item.id}`}
              className={`grid transition-all duration-500 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-2 border-t border-gray-100/50 dark:border-gray-700/50">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{item.answer}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const DutaGenreFAQSection: React.FC = () => {
  return (
    <section id="duta-genre-faq" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* LEFT: Header stays here, Image below it */}
          <div className="order-1 lg:order-1 flex flex-col gap-8">
            <div className="mb-0">
              <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium mb-6">
                🎖️ Duta GenRe FAQ
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Pertanyaan seputar Duta GenRe
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Ketahui peran, tugas, dan alur pemilihan Duta GenRe sebagai penggerak edukasi remaja dan keluarga berencana
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative group">
                <Image
                  src={assets.formQuestions}
                  alt="FAQ Duta GenRe"
                  width={450}
                  height={450}
                  className="relative rounded-3xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Only the questions (accordion) */}
          <div className="order-2 lg:order-2">
            <FAQAccordion />
          </div>
        </div>
      </div>
    </section>
  )
}

export default DutaGenreFAQSection
