"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { usePublicSiteSettings } from "@/components/website/layout/PublicSiteSettingsProvider";

export function AccreditationBadges() {
  const { settings } = usePublicSiteSettings();

  const badges = [
    {
      title: "ISO 9001:2015 Certified",
      subtitle: `Certificate No. ${settings.isoCertification}`,
      icon: "/assets/iiti_cert_icons/iso_icon.jpg",
      href: "/accreditations/iso",
      external: false,
      shape: "circle",
      padding: "p-3",
      priority: false,
    },
    {
      title: "TVEC Registered Institute",
      subtitle: `Registration No. ${settings.tvecAccreditation}`,
      icon: "/assets/iiti_cert_icons/tvec_icon.png",
      href: "/accreditations/tvec",
      external: false,
      shape: "wide",
      padding: "p-0.5",
      priority: true,
    },
    {
      title: "IAF Accredited",
      subtitle: "International Accreditation Forum",
      icon: "/assets/iiti_cert_icons/iaf_icon.png",
      href: settings.iafAccreditationUrl,
      external: true,
      shape: "circle",
      padding: "p-3",
      priority: false,
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-linear-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
            <SectionLabel className="justify-center">Accreditations</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Our Global Accreditations & Certifications
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Built on internationally recognized standards, we ensure academic
              quality, verified compliance, and continuous improvement through
              trusted global certification bodies, reflecting our commitment to
              industry-ready education.
            </p>
          </div>
        </ScrollReveal>

        {/* Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 items-stretch">
          {badges.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.1}>
              <Link
                href={item.href}
                className="group block h-full rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm px-5 py-7 sm:px-6 sm:py-8 text-center shadow-[0_20px_50px_-36px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(249,115,22,0.35)]"
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      relative bg-linear-to-br from-orange-50 to-white border border-orange-100/70 flex items-center justify-center overflow-hidden
                      shadow-sm transition-colors duration-300 group-hover:from-orange-100 group-hover:to-white
                      ${
                        item.shape === "circle"
                          ? "w-28 h-28 rounded-full"
                          : "w-44 h-24 rounded-xl"
                      }
                    `}
                  >
                    <Image
                      src={item.icon}
                      alt={item.title}
                      fill
                      priority={item.priority}
                      quality={100}
                      className={`object-contain ${item.padding}`}
                      sizes="(max-width: 640px) 96px, 112px"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="font-semibold text-slate-900 text-base sm:text-lg">
                      {item.title}
                    </div>

                    <div className="text-slate-600 text-sm mt-2">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
