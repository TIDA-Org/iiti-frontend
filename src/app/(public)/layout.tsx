import { PublicNavbar } from '@/components/website/layout/PublicNavbar'
import { PublicFooter } from '@/components/website/layout/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </>
  )
}
