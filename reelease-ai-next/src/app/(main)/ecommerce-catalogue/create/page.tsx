import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import EcommerceCatalogueCreate from '@/components/feature/ecommerce-catalogue/EcommerceCatalogueCreate'

export default function EcommerceCatalogueCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      }
    >
      <EcommerceCatalogueCreate />
    </Suspense>
  )
}
