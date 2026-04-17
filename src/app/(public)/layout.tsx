import { PublicNavbar } from '@/components/website/layout/PublicNavbar'
import { PublicFooter } from '@/components/website/layout/PublicFooter'
import { PublicSiteSettingsProvider } from '@/components/website/layout/PublicSiteSettingsProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicSiteSettingsProvider>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </PublicSiteSettingsProvider>
  )
}
