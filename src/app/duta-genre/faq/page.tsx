'use client'

import React from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import DutaGenreFAQSection from '@/components/DutaGenreFAQSection'

export default function DutaGenreFAQPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation />

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DutaGenreFAQSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}
