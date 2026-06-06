'use client'

import Image from 'next/image'
import { useState } from 'react'
import { assets } from '@/assets/assets'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: string
}

const FAQAccordion: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const faqData: FAQItem[] = [
    { id: 1, question: "Apa Itu GenRe Bengkulu?", answer: "Generasi Berencana (GenRe) Bengkulu adalah program strategis BKKBN untuk mempersiapkan remaja menjadi generasi yang berencana dalam kehidupan berkeluarga. Program ini fokus pada pemberian edukasi, informasi, dan konseling kepada remaja usia 15-24 tahun." },
    { id: 2, question: "Kapan GenRe Bengkulu Didirikan?", answer: "GenRe Bengkulu didirikan sebagai bagian dari program nasional BKKBN yang diluncurkan untuk mendukung pembangunan kualitas sumber daya manusia Indonesia, khususnya dalam mempersiapkan generasi muda yang berencana dan bertanggung jawab." },
    { id: 3, question: "Dimana Lokasi Sekretariat GenRe Bengkulu?", answer: "Sekretariat GenRe Bengkulu berlokasi di Kota Bengkulu, bekerja sama dengan berbagai instansi terkait dan PIK-R yang tersebar di seluruh wilayah Bengkulu untuk memberikan layanan yang lebih dekat dengan masyarakat." },
    { id: 4, question: "Apa Saja Fungsi GenRe Bengkulu?", answer: "Fungsi GenRe Bengkulu meliputi: (1) Memberikan edukasi tentang kesehatan reproduksi, (2) Menyediakan informasi perencanaan kehidupan berkeluarga, (3) Memberikan konseling dan pendampingan remaja, (4) Mengembangkan keterampilan hidup (life skills), dan (5) Memfasilitasi kegiatan pengembangan diri remaja." },
    { id: 5, question: "Apa Tugas Dari GenRe Bengkulu?", answer: "Tugas GenRe Bengkulu adalah menyelenggarakan program pembinaan remaja melalui PIK-R, memberikan layanan informasi dan konseling, mengadakan pelatihan dan workshop, serta membangun jaringan kerjasama dengan berbagai pihak untuk mendukung pengembangan remaja yang berkualitas." },
    { id: 6, question: "Siapa Saja Anggota GenRe Bengkulu?", answer: "Anggota GenRe Bengkulu terdiri dari remaja usia 15-24 tahun yang tergabung dalam PIK-R, konselor sebaya, pengelola PIK-R, dan berbagai stakeholder yang peduli terhadap pengembangan remaja. Keanggotaan terbuka untuk semua remaja yang ingin berkontribusi dalam program GenRe." }
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
                <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${
                  isOpen 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400'
                }`} />
              </span>
            </button>

            <div
              id={`faq-answer-${item.id}`}
              className={`grid transition-all duration-500 ease-out ${
                isOpen
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-2 border-t border-gray-100/50 dark:border-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-red-50/30 dark:from-gray-900 dark:to-red-900/10 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* FAQ Content */}
          <div className="order-2 lg:order-1">
            <div className="mb-10">
              <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium mb-6">
                💬 FAQ
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Temukan jawaban untuk pertanyaan umum seputar GenRe Bengkulu dan program-programnya
              </p>
            </div>

            <FAQAccordion />
          </div>

          {/* FAQ Image */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative group">
              <Image
                src={assets.formQuestions}
                alt="FAQ Genbi Bengkulu"
                width={450}
                height={450}
                className="relative rounded-3xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
