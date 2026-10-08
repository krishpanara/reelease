import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ImageToVideoGenerate from '@/components/feature/image-to-video/ImageToVideoGenerate'

export default function ImageToVideoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
      <ImageToVideoGenerate />
    </Suspense>
  )
}
