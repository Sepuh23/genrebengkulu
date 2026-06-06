'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { assets } from '@/assets/assets'
import type { NavItem } from '@/types'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: '/', label: 'Beranda' },
    { href: '/pengurus', label: 'Pengurus' },
    { href: '/duta-genre', label: 'Duta GenRe' },
    { href: '/pik-rform', label: 'PIK-R Form' },
    { href: '/kegiatans', label: 'Kegiatan' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Image
                src={assets.genre_bengkulu_logo}
                alt="Logo Forum GenRe Kota Bengkulu"
                className="opacity-90"
                priority
              />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              GenRe Kota Bengkulu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full" />
                )}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-105"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ${isOpen ? 'max-h-[75vh] overflow-y-auto pb-4' : 'max-h-0 overflow-hidden'}`}>
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
