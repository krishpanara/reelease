
export interface BulkRow {
  id: string
  caption: string
  accountIds: string[]
  mediaUrl: string
  contentType: string
  scheduledAt: string
  errors: Record<string, string>
}

export interface BulkResult {
  succeeded: number
  failed: number
  total: number
  failedItems: { index: number; message: string }[]
}
