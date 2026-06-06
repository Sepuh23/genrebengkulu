'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import HeaderSlider from '@/components/HeaderSlider'
import QuickLinksSection from '@/components/QuickLinksSection'
import FAQSection from '@/components/FAQSection'
import PIKRSection from '@/components/PIKRSection'
import KegiatanPreview from '@/components/KegiatanPreview'
import DutaGenreFAQSection from '@/components/DutaGenreFAQSection'
import { supabase } from '@/lib/supabase'

interface SiteSettings {
  bg_type: 'color' | 'image'
  bg_color: string
  bg_image_url: string | null
}

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      console.log('🚀 Fetching site_settings...')
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('bg_type, bg_color, bg_image_url')
        .maybeSingle()

      if (error) {
        console.error('❌ Supabase error:', error)
        return
      }

      if (data) {
        console.log('✅ Settings loaded:', data)
        console.log('🎨 bg_type:', data.bg_type)
        console.log('🖼️ bg_image_url:', data.bg_image_url)
        setSettings(data)
      } else {
        console.warn('⚠️ No data found')
      }
    }

    fetchSettings()
  }, [])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GenRe Kota Bengkulu',
    url: siteUrl,
  }

  // DEBUG: Log settings saat render
  console.log('🎨 Current settings state:', settings)

  const bgStyle: React.CSSProperties =
    settings?.bg_type === 'image' && settings?.bg_image_url
      ? {
          backgroundImage: `url(${settings.bg_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }
      : settings?.bg_type === 'color' && settings?.bg_color
      ? { backgroundColor: settings.bg_color }
      : { backgroundColor: '#f0f0f0' } // Warna abu-abu sebagai fallback

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={bgStyle}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      <HeaderSlider />
      <QuickLinksSection />
      <FAQSection />
      <DutaGenreFAQSection />
      <PIKRSection />
      <KegiatanPreview />
      <Footer />
    </div>
  )
}