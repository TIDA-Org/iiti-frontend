"use client"

import Lottie from 'lottie-react'
import loaderAnimation from '../../../public/assets/pre_loader_animation.json'

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-48 sm:w-56 sm:h-56">
          <Lottie animationData={loaderAnimation} loop autoplay />
        </div>
        <p className="text-stone-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
