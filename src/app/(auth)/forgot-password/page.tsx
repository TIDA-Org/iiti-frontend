'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { delay } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async () => {
    setIsLoading(true)
    await delay(800)
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      {submitted ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Check your email</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            If this email is registered with IITI, password reset instructions have been sent to your inbox.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-orange-500 hover:text-orange-600 font-medium">
            Return to login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Forgot Password?</h1>
            <p className="text-stone-500 text-sm">Enter your registered email address and we&apos;ll send you reset instructions.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : 'Send Reset Instructions'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
