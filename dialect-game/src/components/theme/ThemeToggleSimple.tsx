/**
 * Simple Theme Toggle Component 2025
 * Pure CSS and React implementation without external dependencies
 * Following accessibility and modern design principles
 */

import React, { useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme)
    setIsOpen(false)
  }

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      case 'system':
        return <Monitor className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
    }
  }

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="icon"
        onClick={toggleDropdown}
        className="relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getCurrentIcon()}
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-md border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="p-1">
              <button
                onClick={() => handleThemeSelect('light')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="font-medium">Light</span>
                {theme === 'light' && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>
              
              <button
                onClick={() => handleThemeSelect('dark')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  theme === 'dark' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="font-medium">Dark</span>
                {theme === 'dark' && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                )}
              </button>
              
              <button
                onClick={() => handleThemeSelect('system')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  theme === 'system' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span className="font-medium">System</span>
                {theme === 'system' && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Compact toggle for mobile spaces
export function ThemeToggleCompact() {
  const { setTheme, theme } = useTheme()

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'system':
        return <Monitor className="h-5 w-5" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode'
      case 'dark':
        return 'Switch to system mode'
      case 'system':
        return 'Switch to light mode'
      default:
        return 'Toggle theme'
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label={getLabel()}
      title={getLabel()}
    >
      <div className="transition-all duration-300 transform">
        {getIcon()}
      </div>
    </Button>
  )
}

export default ThemeToggle