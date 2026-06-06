'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { assets } from '@/assets/assets'
import { supabase } from '@/lib/supabase'

interface HeroSlide {
  id: number
  title: string
  hashtag: string
  subtitle: string
  primaryButton: {
    text: string
    href: string
  }
  secondaryButton: {
    text: string
    href: string
  }
  icon: React.ReactNode
}

const HeaderSlider: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  
  // Fetch background dari Supabase
  useEffect(() => {
    const fetchBackground = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('bg_image_url, bg_type')
        .maybeSingle()

      if (error) {
        console.error('Error fetching background:', error)
        return
      }

      if (data && data.bg_type === 'image' && data.bg_image_url) {
        console.log('✅ Hero background loaded:', data.bg_image_url)
        setBackgroundImage(data.bg_image_url)
      }
    }

    fetchBackground()
  }, [])

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      hashtag: '#ForumGenReKotaBengkulu',
      title: 'Forum GenRe Kota Bengkulu',
      subtitle: 'Berkolaborasi Membangun Generasi Muda',
      primaryButton: { text: 'Pengurus', href: '/pengurus' },
      secondaryButton: { text: 'Faq', href: '#faq' },
      icon: (
        <Image
          src={assets.genre_bengkulu_logo}
          alt="Ikon Masa Depan Cerah"
          width={350}
          height={100}
          className="w-full h-auto max-w-[280px] md:max-w-[340px] opacity-90"
          priority
        />
      )
    },
    {
      id: 2,
      hashtag: '#SalamGenRe',
      title: 'GenRe Kota Bengkulu',
      subtitle: 'Iko Lah Nyo Padek Nian, Camkoha Pulo',
      primaryButton: { text: 'Kegiatan', href: '/kegiatans' },
      secondaryButton: { text: 'Pengurus', href: '/pengurus' },
      icon: (
        <Image
          src={assets.salamgenre}
          alt="Ikon Masa Depan Cerah"
          width={350}
          height={100}
          className="w-full h-auto max-w-[280px] md:max-w-[340px] opacity-90"
          priority
        />
      )
    }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  return (
    <div className="relative py-10 md:py-16 overflow-hidden">
      {/* Background image - DINAMIS dari Supabase */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          priority
          className="object-cover object-center select-none pointer-events-none"
        />
      ) : (
        /* Fallback ke asset lokal kalau belum ada data dari Supabase */
        <Image
          src={assets.genrebackground}
          alt="Background"
          fill
          priority
          className="object-cover object-center select-none pointer-events-none"
        />
      )}

      {/* Overlay gradient - biar teks tetap terbaca */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/50 to-gray-900/60 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-gray-900/80" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        {/* 🧱 Container dengan tinggi stabil agar tidak naik-turun */}
        <motion.div
          layout
          layoutRoot
          transition={{ layout: { duration: 0.5, ease: 'easeInOut' } }}
          className="relative flex items-center justify-center min-h-[560px] sm:min-h-[580px] md:min-h-[640px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlides[currentSlide].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-16 px-4 md:px-8"
              layout
            >
              {/* === TEXT SECTION === */}
              <div className="z-10 w-full md:w-1/2 text-center md:text-left flex flex-col justify-center space-y-4 md:space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="inline-flex items-center px-4 py-1.5 text-sm font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-full border border-red-100 dark:border-red-900/50">
                    {heroSlides[currentSlide].hashtag}
                  </span>
                </motion.div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight [text-shadow:0_3px_6px_rgba(0,0,0,0.6)]">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-base md:text-xl font-medium text-white/95 max-w-lg mx-auto md:mx-0 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
                  {heroSlides[currentSlide].subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2 md:pt-4">
                  <Link
                    href={heroSlides[currentSlide].primaryButton.href}
                    className="inline-flex items-center justify-center px-5 md:px-7 py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-[1.03] shadow-md"
                  >
                    {heroSlides[currentSlide].primaryButton.text}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link
                    href={heroSlides[currentSlide].secondaryButton.href}
                    className="inline-flex items-center justify-center px-5 md:px-7 py-2.5 md:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-all duration-300 hover:shadow"
                  >
                    {heroSlides[currentSlide].secondaryButton.text}
                  </Link>
                </div>
              </div>

              {/* === ICON SECTION (Logo dinamis per slide - tetap seperti semula) === */}
              <motion.div
                className="z-10 w-full md:w-1/2 flex justify-center items-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                layout
              >
                <div className="max-w-[300px] md:max-w-[360px] w-full">
                  {heroSlides[currentSlide].icon}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default HeaderSlider