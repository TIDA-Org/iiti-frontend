import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Auth checks are handled client-side in layout files for this prototype
  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
}
