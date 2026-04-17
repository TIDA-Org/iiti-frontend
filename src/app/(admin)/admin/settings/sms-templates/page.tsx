'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2, MessageSquareText } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/useApi'
import {
  apiGetSmsTemplate,
  apiGetSmsTemplates,
  apiUpdateSmsTemplate,
  SmsTemplateApiResponse,
} from '@/lib/api/settings'
import { useAuthStore } from '@/store/authStore'
import { cn, formatDate } from '@/lib/utils'

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  'certificate.ready': 'Sent when a certificate or license is ready for collection.',
  'enrollment.created': 'Sent right after a student enrollment is confirmed.',
  'payment.approved': 'Sent when a submitted payment receipt is verified successfully.',
  'payment.due_reminder': 'Reminder before an installment due date.',
  'payment.overdue': 'Escalation when a payment is overdue and access may be restricted.',
  'payment.receipt_uploaded': 'Acknowledgement after a student uploads a receipt.',
  'payment.rejected': 'Sent when a receipt is rejected and the student must re-upload it.',
}

function extractPlaceholders(template: SmsTemplateApiResponse | null) {
  if (!template) return []
  const matches = `${template.template_en}\n${template.template_si || ''}`.match(/\{[^}]+\}/g) || []
  return [...new Set(matches)].sort()
}

export default function AdminSmsTemplatesPage() {
  const { user } = useAuthStore()
  const { data, isLoading, error, refetch } = useApi(apiGetSmsTemplates, [])
  const [selectedEventKey, setSelectedEventKey] = useState('')
  const [activeTemplate, setActiveTemplate] = useState<SmsTemplateApiResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    label: '',
    template_en: '',
    template_si: '',
    is_active: false,
  })

  const canEdit = user?.role === 'super_admin'
  const placeholders = useMemo(() => extractPlaceholders(activeTemplate), [activeTemplate])

  const loadTemplate = useCallback(async (eventKey: string) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      const template = await apiGetSmsTemplate(eventKey)
      setActiveTemplate(template)
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load SMS template')
      setActiveTemplate(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!data?.length) {
      setSelectedEventKey('')
      return
    }

    setSelectedEventKey((current) => {
      if (current && data.some((item) => item.event_key === current)) {
        return current
      }
      return data[0].event_key
    })
  }, [data])

  useEffect(() => {
    if (!selectedEventKey) return
    void loadTemplate(selectedEventKey)
  }, [loadTemplate, selectedEventKey])

  useEffect(() => {
    if (!activeTemplate) return
    setForm({
      label: activeTemplate.label,
      template_en: activeTemplate.template_en,
      template_si: activeTemplate.template_si || '',
      is_active: activeTemplate.is_active,
    })
  }, [activeTemplate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedEventKey) return
    if (!canEdit) {
      toast.error('Only Super Admin can edit SMS templates.')
      return
    }

    setSaving(true)
    try {
      await apiUpdateSmsTemplate(selectedEventKey, {
        label: form.label.trim(),
        template_en: form.template_en,
        template_si: form.template_si.trim() || null,
        is_active: form.is_active,
      })
      toast.success('SMS template updated')
      await Promise.all([refetch(), loadTemplate(selectedEventKey)])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update SMS template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="SMS Templates"
        subtitle="Manage the bilingual SMS messages used by enrollment, payment, and certificate events"
      />

      <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
        {!data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No SMS templates were returned by the backend.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="mb-4 px-2">
                <h2 className="text-sm font-semibold text-slate-800">Available Events</h2>
                <p className="mt-1 text-xs text-slate-500">Each event key maps directly to the backend notification trigger.</p>
              </div>

              <div className="space-y-2">
                {data.map((template) => {
                  const isActive = template.event_key === selectedEventKey

                  return (
                    <button
                      key={template.event_key}
                      type="button"
                      onClick={() => setSelectedEventKey(template.event_key)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                        isActive
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{template.label}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{template.event_key}</p>
                        </div>
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}>
                          {template.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : detailError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  <p>{detailError}</p>
                  <Button variant="outline" className="mt-4" onClick={() => selectedEventKey && void loadTemplate(selectedEventKey)}>
                    Retry
                  </Button>
                </div>
              ) : activeTemplate ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageSquareText className="h-5 w-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-slate-800">{activeTemplate.label}</h2>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{TEMPLATE_DESCRIPTIONS[activeTemplate.event_key] || 'Backend-managed SMS notification template.'}</p>
                      <p className="mt-2 text-xs text-slate-400">Last updated {formatDate(activeTemplate.updated_at)}</p>
                    </div>
                    <span className={cn('inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium', form.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}>
                      {form.is_active ? 'Active template' : 'Currently disabled'}
                    </span>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Template Label</label>
                        <Input
                          value={form.label}
                          disabled={!canEdit}
                          onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">English Template</label>
                        <Textarea
                          rows={6}
                          value={form.template_en}
                          disabled={!canEdit}
                          onChange={(event) => setForm((current) => ({ ...current, template_en: event.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Sinhala Template</label>
                        <Textarea
                          rows={6}
                          value={form.template_si}
                          disabled={!canEdit}
                          onChange={(event) => setForm((current) => ({ ...current, template_si: event.target.value }))}
                        />
                      </div>

                      <label className={cn('flex items-center justify-between rounded-xl border px-4 py-3 text-sm', canEdit ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-100')}>
                        <div>
                          <p className="font-medium text-slate-700">Enable this SMS event</p>
                          <p className="mt-1 text-xs text-slate-500">Turning this off disables the message for this backend event system-wide.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          disabled={!canEdit}
                          onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                          className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        />
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-slate-800">Available Placeholders</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {placeholders.length > 0 ? (
                            placeholders.map((placeholder) => (
                              <span key={placeholder} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                {placeholder}
                              </span>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">No placeholders detected in this template.</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        <h3 className="font-semibold text-slate-800">Backend Event Key</h3>
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                          {activeTemplate.event_key}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        <h3 className="font-semibold text-slate-800">Access</h3>
                        <p className="mt-2 text-xs text-slate-500">
                          {canEdit
                            ? 'You can edit and save template changes.'
                            : 'Your role can review templates, but only Super Admin can edit them.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 pt-5">
                    <Button type="submit" disabled={!canEdit || saving}>
                      {saving ? 'Saving...' : 'Save Template'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                  Select an SMS template to start editing.
                </div>
              )}
            </section>
          </div>
        )}
      </DataLoader>
    </div>
  )
}
