'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetCharactersQuery } from '@/redux/api/characterApi'
import { Character } from '@/types/character'
import { Loader2, Search, Users } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Input from '@/components/ui/input'
import { getMediaUrl } from '@/utils'

export interface CharacterPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: any) => void
}

export default function CharacterPickerModal({ isOpen, onClose, onSelect }: CharacterPickerModalProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20
  const observer = useRef<IntersectionObserver | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const {
    data: charactersData,
    isLoading,
    isFetching,
  } = useGetCharactersQuery({
    page,
    limit,
    search: debouncedSearch,
    status: 'active',
  })

  const characters = charactersData?.data?.characters || []
  const hasMore = charactersData?.data?.pagination?.total
    ? characters.length < charactersData.data.pagination.total
    : false

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetching) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, isFetching, hasMore]
  )



  const handleSelect = (character: Character) => {
    onSelect(character)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl! max-w-[calc(100%-2rem)]! rounded-border-radius! max-h-[85vh] gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="border-b border-glass-border space-y-1">
          <DialogTitle className="text-xl flex items-center justify-between flex-wrap gap-4 mb-3 rtl:flex-row-reverse">
            <div className="flex items-center gap-2 rtl:flex-row-reverse">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </span>
              {t('select_character', { defaultValue: 'Select Character' })}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('character_picker_description', { defaultValue: 'Select an existing character or upload a new one.' })}
          </DialogDescription>
        </DialogHeader>

        <div className="px-0 py-4">
          <div className="relative group w-full">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all text-sm" />
            <Input
              placeholder={t('search_characters', { defaultValue: 'Search characters...' })}
              className="w-full pl-10 rtl:pr-10 rtl:pl-auto h-11 border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pt-4 no-scrollbar relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t('loading_characters', { defaultValue: 'Loading characters...' })}
              </p>
            </div>
          ) : characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('no_characters_found', { defaultValue: 'No characters found' })}</p>
                <p className="text-sm text-muted-foreground">
                  {t('no_characters_description', { defaultValue: "We couldn't find any characters in your library." })}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {characters.map((char: Character, index: number) => (
                  <div
                    key={char._id || index}
                    className="cursor-pointer group relative rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all aspect-[3/4]"
                    onClick={() => handleSelect(char)}
                  >
                    {char.image_url && (
                      <Image
                        src={getMediaUrl(char.image_url) || ''}
                        alt={char.name || 'Character'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-sm truncate">{char.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div ref={lastElementRef} className="flex justify-center py-6 h-10">
                  {isFetching && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">
                        {t('loading_more', { defaultValue: 'Loading more...' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Characters selection lists */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
