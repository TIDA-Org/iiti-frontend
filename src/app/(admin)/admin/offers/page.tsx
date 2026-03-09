import { MOCK_OFFERS } from '@/lib/mock-data/offers'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function AdminOffersPage() {
  return (
    <div>
      <PageHeader
        title="Offers & Discounts"
        subtitle="Manage promotional offers"
        actions={
          <Link href="/admin/offers/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Offer
          </Link>
        }
      />
      <div className="grid gap-4">
        {MOCK_OFFERS.map(offer => (
          <div key={offer.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">{offer.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{offer.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>Discount: {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `LKR ${offer.discountValue.toLocaleString()}`}</span>
                  <span>Valid: {formatDate(offer.validFrom)} – {formatDate(offer.validUntil)}</span>
                </div>
              </div>
              <StatusBadge status={offer.isActive ? 'active' : 'inactive'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
