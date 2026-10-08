import { apiHandler } from '@/utils/apiHandler'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ providerId: string }> }) {
  const resolvedParams = await params;
  return apiHandler(request, `/ai-feature-credit/provider/${resolvedParams.providerId}`)
}
