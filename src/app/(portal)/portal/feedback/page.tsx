'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiCreateFeedback, type FeedbackType } from '@/lib/api/feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Send } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = [
  'Course Content',
  'Instructor Performance',
  'Facility & Infrastructure',
  'Administrative Process',
  'Learning Materials',
  'Classroom Experience',
  'Support Services',
  'Other',
]

export default function FeedbackSubmissionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    type: 'feedback' as FeedbackType,
    category: '',
    subject: '',
    description: '',
    is_anonymous: false,
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.subject.length < 5) {
      toast.error('Subject must be at least 5 characters')
      return
    }

    if (formData.description.length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }

    setIsLoading(true)
    try {
      await apiCreateFeedback(formData)
      toast.success('Your feedback has been submitted successfully!')
      
      // Reset form
      setFormData({
        type: 'feedback',
        category: '',
        subject: '',
        description: '',
        is_anonymous: false,
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/portal/feedback/history')
      }, 2000)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Submit Feedback or Complaint</h1>
        <p className="text-slate-600 mt-2">Help us improve by sharing your feedback or reporting an issue</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {(['feedback', 'complaint'] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={e => handleChange('type', e.target.value)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="text-sm text-slate-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              • <strong>Feedback:</strong> Suggestions for improvement
              <br />• <strong>Complaint:</strong> Issue or concern that needs to be addressed
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              id="subject"
              placeholder="Brief subject line"
              value={formData.subject}
              onChange={e => handleChange('subject', e.target.value)}
              maxLength={255}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.subject.length}/255 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your feedback or complaint"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.description.length}/2000 characters</p>
          </div>

          {/* Anonymous Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={e => handleChange('is_anonymous', e.target.checked)}
                className="w-4 h-4 text-blue-600 mt-1"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Submit Anonymously</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your identity will be hidden from staff. However, you won&apos;t receive updates about your submission.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Important:</strong> All feedback is valuable and will be reviewed by our management team. 
          We aim to respond to all submissions within 7 business days.
        </div>
      </div>
    </div>
  )
}
