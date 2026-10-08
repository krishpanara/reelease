import { apiHandler } from '@/utils/apiHandler'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return apiHandler(request, '/notification')
}

export async function PUT(request: NextRequest) {
  return apiHandler(request, '/notification/read-all')
}

export async function POST(request: NextRequest) {
  return apiHandler(request, '/notification/delete')
}
