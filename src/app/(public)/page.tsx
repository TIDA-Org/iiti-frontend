import { NewsBanner } from '@/components/website/home/NewsBanner'
import { HeroSection } from '@/components/website/home/HeroSection'
import { AccreditationBadges } from '@/components/website/home/AccreditationBadges'
import { StatsSection } from '@/components/website/home/StatsSection'
import { GoogleReviewSection } from '@/components/website/home/GoogleReviewSection'
import { CoursesPreview } from '@/components/website/home/CoursesPreview'
import { WhyChooseUs } from '@/components/website/home/WhyChooseUs'
import { CertificatesSection } from '@/components/website/home/CertificatesSection'
import { TestimonialsSection } from '@/components/website/home/TestimonialsSection'
import { JobPortalTeaser } from '@/components/website/home/JobPortalTeaser'
import { ContactCta } from '@/components/website/home/ContactCta'

export default function HomePage() {
  return (
    <>
      <NewsBanner />
      <main>
        <HeroSection />
        <AccreditationBadges />
        <StatsSection />
        <GoogleReviewSection />
        <CoursesPreview />
        <WhyChooseUs />
        <CertificatesSection />
        <TestimonialsSection />
        <JobPortalTeaser />
        <ContactCta />
      </main>
    </>
  )
}
