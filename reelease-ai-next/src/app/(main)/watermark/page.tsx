import { WatermarkView } from '@/components/feature/watermark/WatermarkView'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watermark',
  description: 'Configure and preview content watermark overlays.',
}

export default function WatermarkPage() {
  return <WatermarkView />
}
