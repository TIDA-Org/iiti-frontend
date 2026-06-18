'use client'

import { useEffect, useState } from 'react'
import { apiGetAllFeedback, apiUpdateFeedbackStatus, apiAddAdminResponse, type FeedbackComplaint, type FeedbackStatus, type FeedbackType } from '@/lib/api/feedback'
import { PageLoader } from '@/components/shared/PageLoader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronDown,
  MessageSquare,
  Send,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

const STATUS_COLORS: Record<FeedbackStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending' },
  reviewing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Reviewing' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Closed' },
}

const TYPE_COLORS: Record<FeedbackType, { bg: string; text: string; label: string }> = {
  feedback: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Feedback' },
  complaint: { bg: 'bg-red-50', text: 'text-red-700', label: 'Complaint' },
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackComplaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterType, setFilterType] = useState<FeedbackType | ''>('')
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackComplaint | null>(null)
  const [responseText, setResponseText] = useState('')
  const [newStatus, setNewStatus] = useState<FeedbackStatus | ''>('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true)
        const data = await apiGetAllFeedback(filterType || undefined, filterStatus || undefined)
        setFeedbacks(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err: any) {
        setError(err?.message || 'Failed to load feedback')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()
  }, [filterType, filterStatus])

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    setIsSubmittingResponse(true)
    try {
      await apiAddAdminResponse(selectedFeedback.id, {
        admin_response: responseText.trim(),
        status: newStatus || undefined,
      })
      
      toast.success('Response submitted successfully')
      setResponseText('')
      setNewStatus('')
      setSelectedFeedback(null)
      
      // Refresh list
      const data = await apiGetAllFeedback(filterType || undefined, filterStatus || undefined)
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit response')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const handleStatusChange = async (feedback: FeedbackComplaint, status: FeedbackStatus) => {
    try {
      await apiUpdateFeedbackStatus(feedback.id, { status })
      toast.success('Status updated successfully')
      
      // Refresh list
      const data = await apiGetAllFeedback(filterType || undefined, filterStatus || undefined)
      setFeedbacks(Array.isArray(data) ? data : [])
      if (selectedFeedback?.id === feedback.id) {
        const updated = data.find(f => f.id === feedback.id)
        if (updated) setSelectedFeedback(updated)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status')
    }
  }

  const filteredFeedbacks = feedbacks.filter(f => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        f.subject.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (isLoading) return <PageLoader />

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    hasResponse: feedbacks.filter(f => f.admin_response).length,
    complaints: feedbacks.filter(f => f.type === 'complaint').length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Feedback & Complaints Management</h1>
        <p className="text-slate-600 mt-2">Review and respond to student feedback and complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Responded</div>
          <div className="text-2xl font-bold text-green-600">{stats.hasResponse}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Complaints</div>
          <div className="text-2xl font-bold text-red-600">{stats.complaints}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject, description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as FeedbackType | '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">All Types</option>
              <option value="feedback">Feedback</option>
              <option value="complaint">Complaint</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as FeedbackStatus | '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Feedbacks Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No feedback found</h3>
            <p className="text-slate-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Response</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFeedbacks.map(feedback => (
                  <tr key={feedback.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900 truncate max-w-xs" title={feedback.subject}>
                        {feedback.subject}
                      </div>
                      {feedback.is_anonymous && (
                        <Badge variant="outline" className="mt-1">Anonymous</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${TYPE_COLORS[feedback.type].bg} ${TYPE_COLORS[feedback.type].text}`}>
                        {TYPE_COLORS[feedback.type].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${STATUS_COLORS[feedback.status].bg} ${STATUS_COLORS[feedback.status].text}`}>
                        {STATUS_COLORS[feedback.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{feedback.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">
                        {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {feedback.admin_response ? (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFeedback(feedback)
                          setResponseText(feedback.admin_response || '')
                          setNewStatus(feedback.status)
                        }}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFeedback(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Type</label>
                  <Badge className={`${TYPE_COLORS[selectedFeedback.type].bg} ${TYPE_COLORS[selectedFeedback.type].text} mt-1`}>
                    {TYPE_COLORS[selectedFeedback.type].label}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as FeedbackStatus)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {(['pending', 'reviewing', 'resolved', 'closed'] as const).map(status => (
                      <option key={status} value={status}>
                        {STATUS_COLORS[status].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Category</label>
                <p className="mt-1 text-slate-700">{selectedFeedback.category}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Subject</label>
                <p className="mt-1 text-slate-700 font-medium">{selectedFeedback.subject}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Student Submission</label>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                  {selectedFeedback.description}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Admin Response</label>
                <Textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Enter your response to the student..."
                  rows={4}
                  disabled={isSubmittingResponse}
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                <p><strong>Submitted:</strong> {new Date(selectedFeedback.created_at).toLocaleString()}</p>
                {selectedFeedback.admin_responded_at && (
                  <p><strong>Responded:</strong> {new Date(selectedFeedback.admin_responded_at).toLocaleString()}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                  disabled={isSubmittingResponse}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={isSubmittingResponse}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingResponse ? 'Submitting...' : 'Submit Response'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
