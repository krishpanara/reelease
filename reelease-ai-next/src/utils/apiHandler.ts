import { NextRequest, NextResponse } from 'next/server'

/**
 * Common handler to proxy requests from Next.js API routes to the backend API.
 *
 * @param request - Original NextRequest
 * @param endpoint - Backend endpoint (e.g., '/auth/login', '/faq/all')
 * @param overridenMethod - Optional method override (e.g., if you want to use POST to a PUT endpoint)
 * @returns NextResponse
 */
export async function apiHandler(request: NextRequest, endpoint: string, overridenMethod?: string) {
  try {
    const method = overridenMethod || request.method
    const authHeader = request.headers.get('authorization')
    const contentType = request.headers.get('content-type')

    // Normalize backend API URL
    const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let url = `${BACKEND_API_URL.replace(/\/$/, '')}${normalizedEndpoint}`

    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }

    const headers: Record<string, string> = {}

    // Forward all headers from the original request
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      // Skip headers that should be set by fetch or are specific to the proxy request
      if (['host', 'content-length', 'connection', 'content-type'].includes(lowerKey)) {
        return
      }
      headers[key] = value
    })

    // Explicitly set content-type if available
    if (contentType) {
      headers['Content-Type'] = contentType
    }

    // Ensure Authorization header is explicitly handled if needed (it should be in request.headers already)
    if (authHeader && !headers['authorization'] && !headers['Authorization']) {
      headers['Authorization'] = authHeader
    }

    // Add IP forwarding headers
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || ''
    if (clientIp) {
      headers['X-Forwarded-For'] = clientIp
      headers['X-Real-IP'] = clientIp
    }

    
    let body: BodyInit | null | undefined
    if (!['GET', 'HEAD'].includes(method)) {
      if (contentType?.includes('application/json')) {
        try {
          const jsonBody = await request.json()
          body = JSON.stringify(jsonBody)
        } catch {
          // Body might be empty
        }
      } else if (contentType?.includes('multipart/form-data')) {
        // For multipart/form-data, we use a Buffer to ensure the content-length is correct
        // and the boundary is preserved. This is more stable for proxying to multer.
        // We consume the stream manually to avoid some default Next.js limits on helper methods.
        const chunks = []
        const reader = request.body?.getReader()
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
          }
        }
        const buffer = Buffer.concat(chunks)
        body = buffer

        // Check if the body was truncated by Next.js/Middleware (common 10MB limit in dev)
        const originalContentLength = parseInt(request.headers.get('content-length') || '0')
        if (originalContentLength > 0 && buffer.length < originalContentLength) {
          console.warn(
            `Request body truncated: expected ${originalContentLength} bytes, but only received ${buffer.length} bytes.`,
          )
          return NextResponse.json(
            {
              message: `Request body was truncated by the server. Your payload (${(originalContentLength / (1024 * 1024)).toFixed(1)}MB) exceeds the current limit (10MB). Please increase the limit in next.config.ts or upload smaller files.`,
            },
            { status: 413 },
          )
        }
      } else {
        // For other binary types, we pass the stream directly
        body = request.body
      }
    }

    const doFetch = () =>
      fetch(url, {
        method,
        headers,
        body,
        // @ts-expect-error - duplex is required for streaming requests in Node.js
        duplex: 'half',
      })

    let response: Response
    try {
      response = await doFetch()
    } catch (err) {
      // A pooled keep-alive connection can be reset by the backend; retry reads once.
      // Writes are not retried so nothing is ever submitted twice.
      if (!['GET', 'HEAD'].includes(method)) throw err
      await new Promise((resolve) => setTimeout(resolve, 300))
      response = await doFetch()
    }

    const responseContentType = response.headers.get('content-type')

    if (responseContentType && responseContentType.includes('application/json')) {
      const data = await response.json()

      // Improve backend error messages that might be related to Next.js proxy truncation
      if (response.status === 400 && data.message?.includes('end of form')) {
        data.message =
          "The upload was interrupted. This usually happens when the payload exceeds the Next.js 10MB development limit. Please increase 'middlewareClientMaxBodySize' in next.config.ts or upload each file individually."
        return NextResponse.json(data, { status: 413 })
      }

      return NextResponse.json(data, { status: response.status })
    } else {
      // For binary responses or other types
      const responseBody = await response.arrayBuffer()
      return new NextResponse(responseBody, {
        status: response.status,
        headers: {
          'content-type': responseContentType || 'application/octet-stream',
          ...(response.headers.get('content-disposition') && {
            'content-disposition': response.headers.get('content-disposition')!,
          }),
        },
      })
    }
  } catch (error: any) {
    console.error(`API Proxy Error [${endpoint}]:`, error.message)

    // Check if it's a body size limit error or truncation
    if (
      error.message?.includes('exceeded') ||
      error.message?.includes('too large') ||
      error.message?.includes('end of form')
    ) {
      return NextResponse.json(
        {
          message:
            "The request payload is too large or was truncated. This is often due to a 10MB limit in the Next.js development server. Please increase 'middlewareClientMaxBodySize' in next.config.ts or upload smaller files.",
        },
        { status: 413 },
      )
    }

    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 })
  }
}
