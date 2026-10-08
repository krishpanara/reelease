'use client'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import { useDeleteCharacterMutation, useGetCharactersQuery } from '@/redux/api/characterApi'
import { getDownloadUrl } from '@/utils'
import { getResolvedImageUrl } from '@/utils/image'
import {
  Calendar,
  Clock,
  Copy,
  Cpu,
  Download,
  Grid3X3,
  ImageIcon,
  LayoutGridIcon,
  List,
  Plus,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import DeleteConfirmationModal from '@/components/reusable/DeleteConfirmationModal'
import { MediaViewModal } from '@/components/reusable/MediaViewModal'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/utils/clipboard'

const MyCharactersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<{ id: string; name: string } | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<any | null>(null)
  const [deleteCharacter, { isLoading: isDeleting }] = useDeleteCharacterMutation()
  const { t } = useTranslation()
  const router = useRouter()
  const {
    data: charactersData,
    isLoading,
    refetch,
  } = useGetCharactersQuery({
    page: 1,
    limit: 50,
  })

  const characters = charactersData?.data?.characters || []

  const filteredCharacters = characters.filter(
    (char: any) =>
      char.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string, name: string) => {
    setCharacterToDelete({ id, name })
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return

    try {
      await deleteCharacter(characterToDelete.id).unwrap()
      toast.success('Character deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to delete character')
    } finally {
      setDeleteModalOpen(false)
      setCharacterToDelete(null)
    }
  }

  const handleDownload = async (imageUrl: string, characterName: string) => {
    try {
      const url = getDownloadUrl(imageUrl)
      if (!url) return

      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${characterName.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading characters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ImageIcon className="w-6 h-6 text-primary animate-pulse" />}
        title={t('my_characters', { defaultValue: 'My Characters' })}
        subtitle={`You have ${filteredCharacters.length} character${filteredCharacters.length !== 1 ? 's' : ''}`}
        showBackButton={false}
        endContent={
          <Button
            onClick={() => router.push(ROUTES.CHARACTERS)}
            className="h-10 px-5 rounded-xl text-white! font-bold gap-2 primary-btn shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('add_characters', { defaultValue: 'Add Characters' })}
          </Button>
        }
      />

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 rtl:right-3 rtr:left-auto   top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pr-10"
          />
        </div>

        <div className="flex items-center gap-1 dark:bg-white/3! border bg-white rounded-border-radius p-1 h-10 ">
          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex h-8! w-8! p-0! items-center justify-center rounded-border-radius-inner! transition-all duration-200',
              viewMode === 'grid'
                ? 'primary-btn text-white shadow-md'
                : 'text-subtitle-color bg-white/3! border-none'
            )}
          >
            <LayoutGridIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setViewMode('list')}
            className={cn(
              'flex h-8! w-8! p-0! items-center justify-center rounded-border-radius-inner! transition-all duration-200',
              viewMode === 'list'
                ? 'primary-btn text-white shadow-md'
                : 'text-subtitle-color bg-white/3! border-none'
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Characters List */}
      {filteredCharacters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full flex bg-primary/15 items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No characters found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by generating your first AI character'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((char: any) => (
            <div
              key={char._id || char.id}
              onClick={() => setSelectedCharacter(char)}
              className="group relative flex flex-col p-3 rounded-border-radius border border-border/40 glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 glass-dark-card h-full cursor-pointer bg-white/3"
            >
              {/* Media Preview Section */}
              <div className="relative flex-none aspect-[4/3] sm:aspect-video rounded-border-radius overflow-hidden transition-all duration-500">
                <div className="absolute inset-0 transition-all duration-300">
                  <div className="relative w-full h-full rounded-border-radius overflow-hidden hover-gradient-border shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                    <Image
                      src={getResolvedImageUrl(char.image_url)}
                      alt={char.name}
                      fill
                      unoptimized
                      className="object-cover object-top rounded-border-radius transition-transform duration-700 group-hover:scale-95"
                    />
                    <div className="absolute inset-0 bg-black/3 dark:bg-white/8! border transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />

                    {/* Status Badge Overlay (Using Style) */}
                    <div className="absolute top-3 left-3 z-10 text-white!">
                      <Badge className="px-2.5 py-0.5 text-xs font-bold rounded-md border shadow-2xl bg-black/55 border-white/30 backdrop-blur-md ">
                        {char.style || 'Generated'}
                      </Badge>
                    </div>

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(char.image_url, char.name)
                        }}
                        className="w-8! h-8! p-0! rounded-full bg-black/55! border border-white/30 text-white! hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(char._id || char.id, char.name)
                        }}
                        disabled={isDeleting}
                        className="w-8! h-8! p-0! rounded-full bg-black/55! border border-white/30 text-white! hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-4 flex flex-col flex-1">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3
                        className="text-sm font-semibold text-title-color dark:text-white truncate transition-colors"
                        title={char.name}
                      >
                        {char.name}
                      </h3>
                      {char.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1" title={char.description}>
                          {char.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-3xs sm:text-xs font-semibold text-subtitle-color dark:text-white bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md  uppercase tracking-wider">
                          {char.resolution}
                        </span>
                      </div>
                    </div>
                  </div>

                  {char.prompt && (
                    <div className="group/prompt relative rounded-[8px] bg-black/3 dark:bg-white/5 p-3 border border-glass-border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                            Prompt
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2" title={char.prompt}>
                            {char.prompt}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 shrink-0 opacity-0 group-hover/prompt:opacity-100 transition-opacity bg-white dark:bg-white/10 shadow-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            copyToClipboard(char.prompt)
                            toast.success('Prompt copied to clipboard')
                          }}
                          title="Copy Prompt"
                        >
                          <Copy className="w-3! h-3! text-title-color" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer info */}
                <div className="mt-auto pt-3 border-t border-glass-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="text-subtitle-color font-medium truncate text-sm">
                      {new Date(char.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {new Date(char.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCharacters.map((char: any) => (
            <Card key={char._id || char.id} className="group hover:shadow-lg transition-all cursor-pointer bg-white/3" onClick={() => setSelectedCharacter(char)}>
              <div className="flex items-start gap-4 p-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <Image
                    src={getResolvedImageUrl(char.image_url)}
                    alt={char.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{char.name}</h3>
                      {char.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{char.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button className='h-8 w-8 rounded-full p-0! shrink-0 bg-black/30 border border-glass-border text-white! hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center' onClick={(e) => { e.stopPropagation(); handleDownload(char.image_url, char.name); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        className='h-8 w-8 p-0! rounded-full bg-black/30 border border-glass-border text-white! hover:bg-black/40 hover:text-white backdrop-blur-3xl flex items-center justify-center'
                        disabled={isDeleting}
                        onClick={(e) => { e.stopPropagation(); handleDelete(char._id || char.id, char.name); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="default">
                      <Cpu className="w-3 h-3 mr-1" />
                      {char.style}
                    </Badge>
                    <Badge variant="outline">{char.resolution}</Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(char.created_at).toLocaleDateString()}
                    </span>
                    <span>{char.credits_used} credits</span>
                  </div>

                  {char.prompt && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      <strong>Prompt:</strong> {char.prompt}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setCharacterToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('delete_character', 'Delete Character')}
        description={`Are you sure you want to delete "${characterToDelete?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <MediaViewModal
        isOpen={selectedCharacter !== null}
        onClose={() => setSelectedCharacter(null)}
        title={selectedCharacter?.name || ''}
        mediaUrl={selectedCharacter ? getResolvedImageUrl(selectedCharacter.image_url) : null}
        isVideo={false}
        prompt={selectedCharacter?.prompt}
        description={selectedCharacter?.description}
        createdAt={selectedCharacter?.created_at}
        creditsUsed={selectedCharacter?.credits_used}
        customBadges={
          selectedCharacter && (
            <>
              <Badge className="px-2.5 py-0.5 text-xs font-bold rounded-md border shadow-2xl bg-primary text-white!">
                {selectedCharacter.style || 'Generated'}
              </Badge>
              <span className="text-3xs sm:text-xs font-semibold text-subtitle-color dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {selectedCharacter.resolution}
              </span>
            </>
          )
        }
        onDownload={selectedCharacter ? () => handleDownload(selectedCharacter.image_url, selectedCharacter.name) : undefined}
        onDelete={selectedCharacter ? () => {
          const char = selectedCharacter
          setSelectedCharacter(null)
          handleDelete(char._id || char.id, char.name)
        } : undefined}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default MyCharactersPage
