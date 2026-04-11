'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGetRoles } from '@/lib/api/roles'
import { useAuthStore } from '@/store/authStore'

export function usePermissionAccess() {
  const { user } = useAuthStore()
  const [permissionCodes, setPermissionCodes] = useState<Set<string> | null>(null)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadRolePermissions = async () => {
      setPermissionsLoaded(false)

      if (!user?.role) {
        if (!cancelled) {
          setPermissionCodes(null)
          setPermissionsLoaded(true)
        }
        return
      }

      try {
        const roles = await apiGetRoles()
        const currentRole = roles.find((r) => r.slug === user.role)
        const codes = new Set((currentRole?.permissions || []).map((p) => p.code))
        if (!cancelled) {
          setPermissionCodes(codes)
          setPermissionsLoaded(true)
        }
      } catch {
        if (!cancelled) {
          setPermissionCodes(null)
          setPermissionsLoaded(true)
        }
      }
    }

    loadRolePermissions()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    const onPermissionsUpdated = async () => {
      if (!user?.role) return
      setPermissionsLoaded(false)
      try {
        const roles = await apiGetRoles()
        const currentRole = roles.find((r) => r.slug === user.role)
        setPermissionCodes(new Set((currentRole?.permissions || []).map((p) => p.code)))
        setPermissionsLoaded(true)
      } catch {
        setPermissionCodes(null)
        setPermissionsLoaded(true)
      }
    }

    window.addEventListener('rbac-updated', onPermissionsUpdated)
    return () => window.removeEventListener('rbac-updated', onPermissionsUpdated)
  }, [user])

  const hasPermission = useMemo(() => {
    return (permission: string) => {
      if (!user?.role) return false
      if (!permissionsLoaded) return false
      if (!permissionCodes) return false
      return permissionCodes.has(permission)
    }
  }, [permissionCodes, permissionsLoaded, user])

  return {
    hasPermission,
    permissionCodes,
    permissionsLoaded,
  }
}
