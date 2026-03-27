'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SearchBar from '@/components/SearchBar'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSearchOpen(false)
    }
    if (isMobileSearchOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isMobileSearchOpen])

  const isActive = (path: string) =>
    pathname === path || (path !== '/' && pathname.startsWith(path + '/'))

  const navItems = [
    { href: '/', label: 'الرئيسية' },
    { href: '/movies', label: 'الافلام' },
    { href: '/series', label: 'المسلسلات' },
    { href: '/shows', label: 'البرامج التلفزيونية' },
    { href: '/miscellaneous', label: 'المنوعات' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[linear-gradient(180deg,#110a2a_0%,#0d0821_100%)] shadow-[0_8px_28px_rgba(0,0,0,0.46)] backdrop-blur-md">
      <div className="max-w-[1500px] mx-auto px-5 sm:px-6 lg:px-10">
        {/* ── Desktop bar ── */}
        <div className="hidden lg:flex items-center h-[72px] gap-0 font-[family-name:var(--font-cairo)]">

          {/* Logo — يمين */}
          <Link href="/" className="shrink-0 ml-auto pr-[35px]" style={{ paddingRight: '35px' }}>
            <span className="text-[38px] xl:text-[42px] leading-none font-black tracking-[-0.03em] select-none">
              <span className="text-white">Cima</span><span className="text-[#f6c90e]">View</span>
            </span>
          </Link>

          {/* Nav — وسط */}
          <nav className="flex items-center justify-center gap-8 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-9 xl:px-10 py-2.5 text-[16px] xl:text-[17.5px] leading-snug font-bold transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 right-1/2 translate-x-1/2 w-full h-[2.5px] rounded-full bg-[#f6c90e]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Search — يسار */}
          <div className="mr-auto shrink-0 w-[260px] xl:w-[320px]">
            <SearchBar autoRedirect compact />
          </div>
        </div>

        {/* ── Mobile bar ── */}
        <div className="flex lg:hidden items-center h-[64px] justify-between font-[family-name:var(--font-cairo)]">
          {/* Hamburger */}
          <button
            suppressHydrationWarning
            className="w-10 h-10 rounded-lg border border-white/10 bg-white/[0.05] flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="القائمة"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/">
            <span className="text-[30px] leading-none font-black tracking-[-0.03em] select-none">
              <span className="text-white">Cima</span><span className="text-[#f6c90e]">View</span>
            </span>
          </Link>

          {/* Search */}
          <button
            type="button"
            aria-label="بحث"
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>
          {/* Mobile Search Overlay */}
          {isMobileSearchOpen && (
            <div
              className="fixed inset-0 z-[999] flex items-start justify-center bg-black/70 backdrop-blur-[2px] lg:hidden"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <div
                className="w-full px-4 pt-8"
                style={{ maxWidth: 600 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative bg-[#18181c] rounded-2xl shadow-xl p-4 flex flex-col items-stretch">
                  <SearchBar
                    autoRedirect
                    compact={false}
                    inputRef={mobileSearchInputRef}
                    onAfterNavigate={() => setIsMobileSearchOpen(false)}
                    mobileMode
                    onClose={() => setIsMobileSearchOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] py-3 font-[family-name:var(--font-cairo)]">
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 px-4 rounded-xl text-[15px] font-bold transition-all ${
                    isActive(item.href)
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

