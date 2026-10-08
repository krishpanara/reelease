import ImageToImageGenerate from '@/components/feature/image-to-image/ImageToImageGenerate'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function ImageToImagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
      <ImageToImageGenerate />
    </Suspense>
  )
}
