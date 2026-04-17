'use client'

import { Loader2, LogOut, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
  portalLabel: string
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  portalLabel,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md overflow-hidden rounded-[30px] border-0 bg-white p-0 ring-0 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]"
      >
        <div className="bg-white px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">Are you sure?</DialogTitle>
              <p className="mt-1 text-sm text-slate-600">You are about to leave the {portalLabel}.</p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <DialogHeader className="px-6 pt-5">
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              Logging out will end your current session and return you to the login screen. Make sure any recent work is saved before continuing.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => void onConfirm()}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              {loading ? 'Signing out...' : 'Yes, log out'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}