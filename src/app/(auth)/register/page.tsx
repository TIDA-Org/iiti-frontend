import Link from 'next/link'
import { ArrowRight, ClipboardList } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <ClipboardList className="w-8 h-8 text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Register as a Student
      </h1>
      <p className="text-stone-500 text-sm leading-relaxed mb-8">
        To register as a student at IITI, please complete our online application form.
        Once your application is reviewed and approved, you will receive your student login credentials.
      </p>
      <Link
        href="/apply"
        className="inline-flex items-center gap-2 w-full justify-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
      >
        Start Application
        <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="mt-4 text-sm text-stone-400">
        Already have an account?{' '}
        <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
