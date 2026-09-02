'use client'

import { useState, useRef } from 'react'
import { apiUploadReceipt } from '@/lib/api/receipts'
import { ReceiptApiResponse } from '@/types/receipt'
import { Upload, FileImage, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export interface ReceiptUploadFormProps {
  paymentId: string
  onSuccess?: (receipt: ReceiptApiResponse) => void
}

export function ReceiptUploadForm({ paymentId, onSuccess }: ReceiptUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, GIF, WebP, or PDF files are allowed.'
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_FILE_SIZE_MB} MB.`
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setUploadError(error)
      setSelectedFile(null)
    } else {
      setUploadError(null)
      setSelectedFile(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setUploadError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const receipt = await apiUploadReceipt(paymentId, selectedFile)
      setUploadSuccess(true)
      toast.success('Bank slip uploaded successfully! Staff will review your payment shortly.')
      onSuccess?.(receipt)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setUploadError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Slip Uploaded!</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Your bank slip has been submitted. Staff will review your payment shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={handleInputChange}
          className="sr-only"
          id="slip-upload-input"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileImage className="w-8 h-8 text-amber-500 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB ·{' '}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile() }}
                  className="text-red-500 hover:underline inline-flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Select Slip Image or PDF
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Drag & drop or click to browse · JPG, PNG, PDF · Max {MAX_FILE_SIZE_MB} MB
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedFile || isUploading}
        className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
      >
        {isUploading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Submit Bank Slip
          </>
        )}
      </button>
    </form>
  )
}
