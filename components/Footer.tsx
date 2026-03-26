const SOCIAL_LINKS = [
  {
    title: 'Facebook',
    href: '#',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    title: 'X',
    href: '#',
    path: 'M18.244 2H21.5l-7.11 8.128L22.75 22h-6.546l-5.126-6.697L5.219 22H1.96l7.605-8.694L1.5 2h6.711l4.633 6.106L18.244 2zm-1.142 18.05h1.804L7.228 3.845H5.29L17.102 20.05z',
  },
  {
    title: 'YouTube',
    href: '#',
    path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    title: 'Instagram',
    href: '#',
    path: 'M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.8A3.95 3.95 0 003.8 7.75v8.5a3.95 3.95 0 003.95 3.95h8.5a3.95 3.95 0 003.95-3.95v-8.5a3.95 3.95 0 00-3.95-3.95h-8.5zm9.3 1.35a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.8A3.2 3.2 0 1015.2 12 3.2 3.2 0 0012 8.8z',
  },
]

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="soft-divider max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10" />
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.title}
              href={social.href}
              title={social.title}
              aria-label={social.title}
              className="group w-11 h-11 rounded-full border border-white/[0.1] bg-white/[0.03] text-white/65 transition-all duration-300 ease-out flex items-center justify-center hover:-translate-y-0.5 hover:border-[#f6c90e]/45 hover:bg-[#f6c90e]/10 hover:text-[#f6c90e] hover:shadow-[0_0_24px_rgba(246,201,14,0.22)]"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

