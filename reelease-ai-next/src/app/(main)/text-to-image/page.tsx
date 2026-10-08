import TextToImageGenerate from '@/components/feature/text-to-image/TextToImageGenerate'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function TextToImagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
      <TextToImageGenerate />
    </Suspense>
  )
}
