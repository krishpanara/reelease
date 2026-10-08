import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import EcommerceCatalogue from '@/components/feature/ecommerce-catalogue/EcommerceCatalogue'

export default function EcommerceCataloguePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      }
    >
      <EcommerceCatalogue />
    </Suspense>
  )
}
