import CharacterGenerator from '@/components/feature/characters/CharacterGenerator'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function CharactersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
      <CharacterGenerator />
    </Suspense>
  )
}
