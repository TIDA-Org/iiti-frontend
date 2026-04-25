'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Youtube, MessageCircle } from 'lucide-react'

import { usePublicSiteSettings } from '@/components/website/layout/PublicSiteSettingsProvider'

function buildWhatsAppHref(value: string) {
  const normalized = value.replace(/\D/g, '')
  return normalized ? `https://wa.me/${normalized}` : '#'
}

interface SocialLink {
  href: string
  label: string
  icon: typeof Facebook
}

export function PublicFooter() {
  const { settings } = usePublicSiteSettings()
  const socialLinks = [
    settings.facebookUrl
      ? {
          href: settings.facebookUrl,
          label: 'Facebook',
          icon: Facebook,
        }
      : null,
    settings.youtubeUrl
      ? {
          href: settings.youtubeUrl,
          label: 'YouTube',
          icon: Youtube,
        }
      : null,
    settings.whatsappNumber
      ? {
          href: buildWhatsAppHref(settings.whatsappNumber),
          label: 'WhatsApp',
          icon: MessageCircle,
        }
      : null,
  ].filter((item): item is SocialLink => item !== null)

  return (
    <footer style={{ backgroundColor: '#0A0A0A' }} className="text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1 - Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>IITI</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {settings.instituteName}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 mb-4">
              {settings.tagline}
            </p>
            <div className="flex gap-3">
              <div className="px-3 py-1.5 bg-stone-800 rounded text-xs text-stone-300">ISO 9001:2015</div>
              <div className="px-3 py-1.5 bg-stone-800 rounded text-xs text-stone-300">TVEC Reg</div>
            </div>
            {socialLinks.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Social Media</p>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((item) => {
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-300 transition-colors hover:border-orange-500/40 hover:text-orange-400"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
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
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{settings.contactAddress}</span>
              </li>
              <li className="flex gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{settings.contactPhone}</span>
              </li>
              {settings.whatsappNumber && (
                <li className="flex gap-2.5 text-sm">
                  <Phone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{settings.whatsappNumber}</span>
                </li>
              )}
              <li className="flex gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{settings.contactEmail}</span>
              </li>
            </ul>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-stone-500">TVEC Reg: {settings.tvecAccreditation}</p>
              <p className="text-xs text-stone-500">ISO: {settings.isoCertification}</p>
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
