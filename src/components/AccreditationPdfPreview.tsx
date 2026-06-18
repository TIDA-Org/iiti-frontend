"use client"

import { useMemo } from 'react'

type Props = {
  url: string
  alt?: string
  heightClassName?: string
}

export default function AccreditationPdfPreview({
  url,
  alt,
  heightClassName = 'h-[30rem] sm:h-[58rem]',
}: Props) {
  const embedUrl = useMemo(() => {
    const joiner = url.includes('#') ? '&' : '#'
    return `${url}${joiner}toolbar=0&navpanes=0&scrollbar=0&view=FitH`
  }, [url])

  return (
    <div className="w-full">
      <div
        className={`relative bg-white rounded-md overflow-hidden border border-slate-100 ${heightClassName}`}
        onContextMenu={(event) => event.preventDefault()}
      >
        <iframe
          src={embedUrl}
          title={alt || 'PDF preview'}
          className="w-full h-full"
          loading="lazy"
          tabIndex={-1}
        />

        {/* Blocks clicks/right-clicks so users cannot open PDF viewer controls (save/print). */}
        <div className="absolute inset-0 z-10 bg-transparent" aria-hidden="true" />
      </div>
    </div>
  )
}
