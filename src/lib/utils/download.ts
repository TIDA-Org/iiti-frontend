import { CLIENT_API_BASE_URL } from '@/lib/api/core'

/**
 * Resolve a certificate download URL to a backend-proxied path.
 * 
 * Handles:
 * - Relative backend paths with /api/v1 prefix → strips /api/v1 and proxies via /api/backend
 * - Relative paths without /api/v1 prefix → proxies directly
 * - Absolute backend URLs → extracts pathname, strips /api/v1 if present, then proxies
 * - Storage provider URLs → falls back to backend download endpoint using certId
 * 
 * Examples:
 * - "/api/v1/certificates/abc123/download" → "/api/backend/certificates/abc123/download"
 * - "/certificates/abc123/download" → "/api/backend/certificates/abc123/download"
 * - "https://example.com/api/v1/certificates/abc123/download" → "/api/backend/certificates/abc123/download"
 * - "https://b2.example.com/bucket/cert.pdf" + certId → "/api/backend/certificates/abc123/download"
 */
export function getProxiedCertificateUrl(rawUrl: string | null | undefined, certId?: string): string | null {
  if (!rawUrl && !certId) return null
  
  const url = (rawUrl || '').toString().trim()

  if (!url && certId) {
    // Fallback to backend download endpoint if URL is empty but we have certId
    return `${CLIENT_API_BASE_URL}/certificates/${encodeURIComponent(certId)}/download`
  }

  // Handle relative paths: normalize /api/v1 prefix, then proxy
  if (url.startsWith('/')) {
    let normalizedPath = url
    
    // Strip /api/v1 prefix if present
    if (normalizedPath.startsWith('/api/v1/')) {
      normalizedPath = normalizedPath.replace(/^\/api\/v1/, '')
    }
    
    return `${CLIENT_API_BASE_URL}${normalizedPath}`
  }

  // Handle absolute URLs: extract pathname, normalize, and proxy
  try {
    const parsed = new URL(url)
    let pathname = parsed.pathname || ''
    const search = parsed.search || ''
    
    // Strip /api/v1 prefix if present in absolute URL
    if (pathname.startsWith('/api/v1/')) {
      pathname = pathname.replace(/^\/api\/v1/, '')
    }
    
    // If it looks like a backend certificate endpoint, proxy it
    if (pathname.startsWith('/certificates/')) {
      return `${CLIENT_API_BASE_URL}${pathname}${search}`
    }
  } catch {
    // Not a valid URL, fallthrough
  }

  // If the API returned an external storage URL (Backblaze/S3), prefer the backend download
  // endpoint for the certificate when we have the id. This avoids opening the storage provider URL.
  if (certId) {
    return `${CLIENT_API_BASE_URL}/certificates/${encodeURIComponent(certId)}/download`
  }

  return null
}

export default getProxiedCertificateUrl
