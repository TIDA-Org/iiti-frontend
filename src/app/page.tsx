import { PublicNavbar } from '@/components/website/layout/PublicNavbar'
import { PublicFooter } from '@/components/website/layout/PublicFooter'
import { PublicSiteSettingsProvider } from '@/components/website/layout/PublicSiteSettingsProvider'
import { NewsBanner } from '@/components/website/home/NewsBanner'
import { HeroSection } from '@/components/website/home/HeroSection'
import { AccreditationBadges } from '@/components/website/home/AccreditationBadges'
import { StatsSection } from '@/components/website/home/StatsSection'
import { CoursesPreview } from '@/components/website/home/CoursesPreview'
import { WhyChooseUs } from '@/components/website/home/WhyChooseUs'
import { CertificatesSection } from '@/components/website/home/CertificatesSection'
import { TestimonialsSection } from '@/components/website/home/TestimonialsSection'
import { JobPortalTeaser } from '@/components/website/home/JobPortalTeaser'
import { ContactCta } from '@/components/website/home/ContactCta'

export default function HomePage() {
  return (
    <PublicSiteSettingsProvider>
      <PublicNavbar />
      <NewsBanner />
      <main>
        <HeroSection />
        <AccreditationBadges />
        <StatsSection />
        <CoursesPreview />
        <WhyChooseUs />
        <CertificatesSection />
        <TestimonialsSection />
        <JobPortalTeaser />
        <ContactCta />
      </main>
      <PublicFooter />
    </PublicSiteSettingsProvider>
  )
}
