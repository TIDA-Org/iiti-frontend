'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { INSTITUTE_INFO } from '@/lib/constants'

const loginSchema = z.object({
  username: z.string().min(1, 'Phone number or email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LOGIN_SLIDES = [
  {
    src: '/images/cards/DSC07639.jpg',
    alt: 'Heavy vehicle training',
    eyebrow: 'Industry Focused',
  },
  {
    src: '/images/cards/DSC07575.jpg',
    alt: 'Operator practical session',
    eyebrow: 'Practical Excellence',
  },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const router = useRouter()
  const { login, isLoading, error } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.username, data.password)
    if (result.success) {
      toast.success('Welcome back!')
      if (result.role === 'student') {
        router.push('/portal/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % LOGIN_SLIDES.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="grid min-h-screen w-full overflow-hidden bg-white lg:grid-cols-2">
      {/* Left visual panel */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {LOGIN_SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/55 to-stone-900/15" />

        <div className="relative z-10 p-12">
          <div className="mb-5 inline-flex rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            {LOGIN_SLIDES[activeSlide].eyebrow}
          </div>
          <h2 className="max-w-md text-5xl font-bold leading-[1.08] tracking-[-0.02em] text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Train Today.
            <br />
            Operate Tomorrow.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85">
            Sri Lanka&apos;s premier TVEC-accredited heavy vehicle training institute with industry-ready, practical operator programmes.
          </p>
        </div>

        <div className="relative z-10 flex gap-3 p-12 pt-0">
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">ISO 9001:2015</div>
            <div className="mt-1 text-sm font-semibold text-white">Certificate No. {INSTITUTE_INFO.isoNumber}</div>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">TVEC Registered</div>
            <div className="mt-1 text-sm font-semibold text-white">Reg No. {INSTITUTE_INFO.tvecRegNo}</div>
          </div>
          <div className="ml-auto flex items-end gap-2">
            {LOGIN_SLIDES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/40 hover:bg-white/65'
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center bg-gradient-to-b from-orange-50/60 via-white to-orange-50/30 px-6 py-10 sm:px-10 lg:px-12 -mt-55git checkout lg:mt-0 relative">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-100/70 px-3.5 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Access Portal</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-stone-600">Step back into your training journey and continue where you left off.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                Phone Number or Email
              </label>
              <input
                {...register('username')}
                type="text"
                placeholder="07XXXXXXXX or your@email.com"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
              {errors.username && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 pr-11 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-orange-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg disabled:bg-orange-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" /> Sign In
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-stone-200 pt-5 text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link href="/apply" className="font-semibold text-orange-600 hover:text-orange-700">
              Apply Online
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}