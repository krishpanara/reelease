import { apiHandler } from '@/utils/apiHandler'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    return apiHandler(request, '/caption')
}
export async function POST(request: NextRequest) {
    return apiHandler(request, '/caption')
}
export async function PATCH(request: NextRequest) {
    return apiHandler(request, '/caption')
}
export async function DELETE(request: NextRequest) {
    return apiHandler(request, '/caption')
}
