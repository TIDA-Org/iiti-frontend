import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import { INSTITUTE_INFO } from '@/lib/constants'

export function PublicFooter() {
  return (
    <footer style={{ backgroundColor: '#0A0A0A' }} className="text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1 - Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>IITI</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Imasha International
                </div>
                <div className="text-stone-500 text-xs">Training Institute (Pvt) Ltd</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 mb-4">
              {INSTITUTE_INFO.tagline}
            </p>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 bg-stone-800 rounded text-xs text-stone-300">ISO 9001:2015</div>
              <div className="px-3 py-1.5 bg-stone-800 rounded text-xs text-stone-300">TVEC Reg</div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/courses', label: 'Courses' },
                { href: '/contact', label: 'Contact' },
                { href: '/apply', label: 'Apply Now' },
                { href: '/login', label: 'Login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Programmes */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Programmes</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/courses/forklift', label: 'Forklift Operator Training' },
                { href: '/courses/excavator', label: 'Excavator Operator Training' },
                { href: '/courses/backhoe-loader', label: 'Backhoe Loader Training' },
                { href: '/verify', label: 'Certificate Verification' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact</h4>
            <ul className="space-y-3">
              <li className="flex gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>{INSTITUTE_INFO.address}</span>
              </li>
              <li className="flex gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>{INSTITUTE_INFO.telephone}</span>
              </li>
              <li className="flex gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>{INSTITUTE_INFO.mobile}</span>
              </li>
              <li className="flex gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>{INSTITUTE_INFO.email}</span>
              </li>
            </ul>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-stone-500">TVEC Reg: {INSTITUTE_INFO.tvecRegNo}</p>
              <p className="text-xs text-stone-500">ISO: {INSTITUTE_INFO.isoNumber}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 pt-8 text-center">
          <p className="text-sm text-stone-500">
            © 2025 Imasha International Training Institute (Pvt) Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
