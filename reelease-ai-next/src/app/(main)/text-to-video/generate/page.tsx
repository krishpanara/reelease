import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import TextToVideoGenerate from '@/components/feature/text-to-video/TextToVideoGenerate'

export default function TextToVideoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
      <TextToVideoGenerate />
    </Suspense>
  )
}
