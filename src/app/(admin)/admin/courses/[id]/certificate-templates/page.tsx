'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  apiGetCourse,
  CourseDetailApiResponse,
  apiGetCertificateTemplates,
  apiUpsertCertificateTemplate,
  CertificateSummaryTemplateApiResponse
} from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { ArrowLeft, Save, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CertificateTemplatesPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string

  const { data: course, isLoading: isCourseLoading, error: courseError } = useApi<CourseDetailApiResponse>(
    () => apiGetCourse(courseId),
    [courseId]
  )

  const { data: templates, isLoading: isTemplatesLoading, error: templatesError, refetch: refetchTemplates } = useApi<CertificateSummaryTemplateApiResponse[]>(
    () => apiGetCertificateTemplates(courseId),
    [courseId]
  )

  const [originalText, setOriginalText] = useState<Record<string, string>>({})
  const [editText, setEditText] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Define the required templates based on course type
  const requiredSubTypes = useMemo(() => {
    return course?.is_trial
      ? ['forklift_operator', 'excavator_operator', 'backhoe_loader_operator']
      : ['default']
  }, [course?.is_trial])

  // Initialize form state when templates load
  useEffect(() => {
    if (templates) {
      const initialMap: Record<string, string> = {}
      requiredSubTypes.forEach(subType => {
        const match = templates.find(t =>
          subType === 'default' ? t.sub_course_type === null : t.sub_course_type === subType
        )
        initialMap[subType] = match ? match.summary_text : ''
      })
      setOriginalText(initialMap)
      setEditText(initialMap)
    }
  }, [templates, requiredSubTypes])

  const handleSave = async (subType: string) => {
    setSaving(prev => ({ ...prev, [subType]: true }))
    try {
      const textToSave = editText[subType] || ''
      await apiUpsertCertificateTemplate(courseId, subType, textToSave)
      toast.success('Template saved successfully')
      refetchTemplates()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setSaving(prev => ({ ...prev, [subType]: false }))
    }
  }

  const handleChange = (subType: string, value: string) => {
    setEditText(prev => ({ ...prev, [subType]: value }))
  }

  const isLoading = isCourseLoading || isTemplatesLoading
  const error = courseError || templatesError

  const getSubTypeLabel = (subType: string) => {
    switch (subType) {
      case 'default': return 'Default Template'
      case 'forklift_operator': return 'Sub-Course: Forklift Operator'
      case 'excavator_operator': return 'Sub-Course: Excavator Operator'
      case 'backhoe_loader_operator': return 'Sub-Course: Backhoe Loader (JCB)'
      default: return `Sub-Course: ${subType}`
    }
  }

  return (
    <div>
      <div className="mb-6 mb-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </button>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={refetchTemplates}>
        {course && (
          <>
            <PageHeader
              title="Certificate Templates"
              subtitle={`Manage backside descriptions for ${course.name} (${course.course_code})`}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 text-blue-800">
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <p className="font-semibold mb-1">How this works</p>
                <p>
                  The text you provide below will be dynamically printed on the backside (Page 2) of every certificate generated for this course.
                  When a certificate is first generated, an immutable snapshot of this text is saved to the <code className="bg-blue-100 px-1 rounded">institute_certificates</code> record to ensure legal compliance.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {requiredSubTypes.map(subType => {
                const currentText = editText[subType] ?? ''
                const origText = originalText[subType] ?? ''
                const isDirty = currentText !== origText
                const isSaving = !!saving[subType]
                const isDisabled = !isDirty || isSaving

                // Fallback to course.certificate_summary for default if no template exists yet
                const isDefaultFallback = subType === 'default' && !templates?.find(t => t.sub_course_type === null)
                const displayPlaceholder = isDefaultFallback ? (course.certificate_summary || '') : ''

                return (
                  <div key={subType} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-700">{getSubTypeLabel(subType)}</h3>
                      {subType !== 'default' && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          Trial Sub-Type
                        </span>
                      )}
                      {subType === 'default' && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Standard
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <label className="block text-xs font-medium text-slate-500 mb-2">
                        Competency Backside Text (supports multi-line lists)
                      </label>
                      <textarea
                        value={currentText}
                        onChange={(e) => handleChange(subType, e.target.value)}
                        placeholder={displayPlaceholder || "Enter the list of competencies..."}
                        rows={10}
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono tracking-tight"
                      />
                      {isDefaultFallback && !currentText && (
                        <p className="mt-2 text-xs text-amber-600">
                          * Currently showing fallback text from general course settings. Save to explicitly define the default template.
                        </p>
                      )}

                      <div className="mt-4 flex justify-end items-center gap-3">
                        {isDirty && (
                          <span className="text-xs text-amber-600 font-medium animate-pulse">
                            Unsaved changes
                          </span>
                        )}
                        <button
                          onClick={() => handleSave(subType)}
                          disabled={isDisabled}
                          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isDisabled
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer'
                            }`}
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? "Saving..." : "Save Template"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </DataLoader>
    </div>
  )
}
