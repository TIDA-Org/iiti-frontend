'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { INSTITUTE_INFO } from '@/lib/constants'

const loginSchema = z.object({
  username: z.string().min(1, 'Phone number or email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
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

  return (
    <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl min-h-[600px]">

      {/* Left branded panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #F59E0B 100%)' }}
      >
        <div>

          <Link href="/">
            <div className="flex items-center gap-3 mb-10 cursor-pointer group">

              {/* Logo Image */}
              <Image
                src="/assets/logo.jpg"
                alt="IITI Logo"
                width={200}
                height={70}
                priority
                className="object-contain"
              />

            </div>
          </Link>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Train Today.<br />Operate Tomorrow.
          </h2>

          <p className="text-white/80 text-sm leading-relaxed">
            Sri Lanka&apos;s premier TVEC-accredited heavy vehicle training institute.
            NVQ Level 3 certified programmes for industry-ready operators.
          </p>

        </div>

        <div className="space-y-3">

          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">ISO</div>
            <div>
              <div className="text-white text-xs font-semibold">ISO 9001:2015 Certified</div>
              <div className="text-white/60 text-xs">Certificate No. {INSTITUTE_INFO.isoNumber}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">TV</div>
            <div>
              <div className="text-white text-xs font-semibold">TVEC Registered</div>
              <div className="text-white/60 text-xs">Reg No. {INSTITUTE_INFO.tvecRegNo}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Right form panel */}
      <div className="bg-white flex flex-col justify-center p-8 lg:p-12">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-stone-500 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Phone Number or Email
            </label>

            <input
              {...register('username')}
              type="text"
              placeholder="07XXXXXXXX or your@email.com"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Password
            </label>

            <div className="relative">

              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

            </div>

            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">

            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input {...register('rememberMe')} type="checkbox" className="rounded border-stone-300 text-orange-500" />
              Remember me
            </label>

            <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              Forgot password?
            </Link>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </span>
            )}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{' '}
          <Link href="/apply" className="text-orange-500 hover:text-orange-600 font-medium">
            Apply Online
          </Link>
        </p>

      </div>
    </div>
  )
}