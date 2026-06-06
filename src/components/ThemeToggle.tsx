'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const CurrentIcon = currentTheme.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                const isActive = theme === themeOption.value
                
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="flex-1 text-left">{themeOption.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Simple toggle button version (alternative)
export function SimpleThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}
