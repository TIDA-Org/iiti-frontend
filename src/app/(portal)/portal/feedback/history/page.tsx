'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiGetMyFeedback, type FeedbackComplaint, type FeedbackStatus } from '@/lib/api/feedback'
import { PageLoader } from '@/components/shared/PageLoader'
import { PlusCircle, Eye, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG: Record<FeedbackStatus, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  reviewing: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: AlertCircle },
  resolved: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  closed: { bg: 'bg-slate-50', text: 'text-slate-700', icon: CheckCircle },
}

const TYPE_COLORS = {
  feedback: 'bg-blue-100 text-blue-800',
  complaint: 'bg-red-100 text-red-800',
}

export default function FeedbackHistoryPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackComplaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackComplaint | null>(null)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true)
        const data = await apiGetMyFeedback()
        setFeedbacks(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err: any) {
        setError(err?.message || 'Failed to load feedback')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  if (isLoading) return <PageLoader />

  const pendingCount = feedbacks.filter(f => f.status === 'pending').length
  const respondedCount = feedbacks.filter(f => f.admin_response).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Feedback & Complaints</h1>
          <p className="text-slate-600 mt-2">View your submitted feedback and complaint history</p>
        </div>
        <Link
          href="/portal/feedback"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Feedback
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Total Submissions</div>
          <div className="text-2xl font-bold text-slate-900">{feedbacks.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Pending Response</div>
          <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Responded</div>
          <div className="text-2xl font-bold text-green-600">{respondedCount}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No feedback yet</h3>
          <p className="text-slate-600 mb-4">Share your feedback or report an issue to help us improve</p>
          <Link
            href="/portal/feedback"
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Submit Feedback
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(feedback => {
            const statusConfig = STATUS_CONFIG[feedback.status]
            const StatusIcon = statusConfig.icon
            const typeColor = TYPE_COLORS[feedback.type as keyof typeof TYPE_COLORS]

            return (
              <div
                key={feedback.id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeColor}>
                        {feedback.type === 'feedback' ? '💡' : '⚠️'} {feedback.type}
                      </Badge>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {feedback.status}
                      </span>
                      {feedback.is_anonymous && (
                        <Badge variant="outline">Anonymous</Badge>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1 truncate">
                      {feedback.subject}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {feedback.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="font-medium">{feedback.category}</span>
                      <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
                      {feedback.admin_response && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <MessageCircle className="w-3 h-3" />
                          Admin responded
                        </span>
                      )}
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFeedback(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Feedback Details</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Type</label>
                <Badge className={TYPE_COLORS[selectedFeedback.type as keyof typeof TYPE_COLORS]}>
                  {selectedFeedback.type}
                </Badge>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Status</label>
                <div className={`mt-1 px-3 py-2 rounded-md inline-flex items-center gap-1 ${STATUS_CONFIG[selectedFeedback.status].bg} ${STATUS_CONFIG[selectedFeedback.status].text}`}>
                  {(() => {
                    const IconComponent = STATUS_CONFIG[selectedFeedback.status].icon
                    return <IconComponent className="w-4 h-4" />
                  })()}
                  {selectedFeedback.status}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Category</label>
                <p className="mt-1 text-slate-700">{selectedFeedback.category}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Subject</label>
                <p className="mt-1 text-slate-700">{selectedFeedback.subject}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Description</label>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap">{selectedFeedback.description}</p>
              </div>

              {selectedFeedback.admin_response && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-xs font-semibold text-green-700 uppercase">Admin Response</label>
                  <p className="mt-2 text-slate-700 whitespace-pre-wrap">{selectedFeedback.admin_response}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Responded on {new Date(selectedFeedback.admin_responded_at!).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500">
                <p>Submitted: {new Date(selectedFeedback.created_at).toLocaleString()}</p>
                <p>Last updated: {new Date(selectedFeedback.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
