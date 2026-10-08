'use client'

import React, { useState, useEffect } from 'react'
import { useGenerateCharacterMutation, useGetCharactersQuery, useDeleteCharacterMutation } from '@/redux/api/characterApi'
import { toast } from 'sonner'
import { Bot, Users } from 'lucide-react'
import { PageHeader } from '@/components/reusable/PageHeader'
import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { socket } from '@/services/socketSetup'
import { useAppSelector } from '@/redux/hooks'
import { getDownloadUrl } from '@/utils'
import { useSaveToMediaMutation } from '@/redux/api/aiApi'
import { CharacterForm } from './CharacterForm'
import { CharacterResult } from './CharacterResult'
import { Character } from '@/types/character'

export default function CharacterGenerator() {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state?.auth.user)
  
  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [resolution, setResolution] = useState('1024x1024')
  const [tags, setTags] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [referenceImageUrl, setReferenceImageUrl] = useState('')
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // API mutations
  const [generateCharacter] = useGenerateCharacterMutation()
  const [deleteCharacter, { isLoading: isDeleting }] = useDeleteCharacterMutation()
  
  // Fetch characters
  const { data: charactersData, refetch } = useGetCharactersQuery({
    page: 1,
    limit: 50
  })

  const [resultImage, setResultImage] = useState<string | null>(null)
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  const [saveToMedia, { isLoading: isSaving }] = useSaveToMediaMutation()

  // Socket Listener for AI Task
  useEffect(() => {
    if (!user) return

    const handleTaskUpdate = (payload: any) => {
      if (payload.taskId === currentTaskId && payload.type === 'character') {
        if (payload.status === 'completed') {
          setIsGenerating(false)
          toast.success('Character generated successfully!')
          
          // Set the result image and character data
          if (payload.character) {
            setResultImage(payload.character.image_url)
            setCurrentCharacter(payload.character)
          }
          refetch()
          
          // Reset form
          setName('')
          setDescription('')
          setPrompt('')
          setNegativePrompt('')
          setTags('')
          setImagePreview('')
          setReferenceImageUrl('')
        } else if (payload.status === 'failed') {
          setIsGenerating(false)
          toast.error(payload.message || 'Character generation failed')
          setCurrentTaskId(null)
        }
      }
    }

    const eventName = `ai-task-${(user as any)._id || (user as any).id}`
    socket.on(eventName, handleTaskUpdate)

    return () => {
      socket.off(eventName, handleTaskUpdate)
    }
  }, [user, currentTaskId, refetch])

  const handleGenerate = async () => {
    if (!name.trim() || !prompt.trim()) {
      toast.error('Character name and prompt are required')
      return
    }

    try {
      setIsGenerating(true)
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t)
      
      const res = await generateCharacter({
        name,
        description,
        prompt,
        negative_prompt: negativePrompt,
        style: style as any,
        resolution: resolution as any,
        tags: tagsArray,
        reference_image_url: referenceImageUrl || undefined
      }).unwrap()

      if (res.taskId) {
        setCurrentTaskId(res.taskId)
        toast.success('Character generation started! You will be notified when it\'s ready.')
      } else {
        setIsGenerating(false)
        toast.error('Failed to start generation')
      }
    } catch (error: any) {
      setIsGenerating(false)
      toast.error(error.data?.message || 'Failed to generate character')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try {
      await deleteCharacter(deletingId).unwrap()
      toast.success('Character deleted successfully')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
      refetch()
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to delete character')
    }
  }

  const handleSaveToMedia = async () => {
    if (!currentTaskId) return
    try {
      await saveToMedia({ taskId: currentTaskId }).unwrap()
      // await ({ taskId: currentTaskId }).unwrap()
      toast.success('Character image saved to media library successfully!')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save to media')
    }
  }

  const handleDownload = async () => {
    if (!resultImage) return
    try {
      const url = getDownloadUrl(resultImage)
      if (!url) return
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `character-${currentCharacter?.name || Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users className="w-6 h-6 text-primary animate-pulse" />}
        title={t('character_generator',{defaultValue:'Character Generator'})}
        subtitle={t('character_generator_subtitle',{defaultValue:'Create unique AI-generated characters for your projects'})}
        showBackButton={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Form */}
        <CharacterForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          style={style}
          setStyle={setStyle}
          resolution={resolution}
          setResolution={setResolution}
          tags={tags}
          setTags={setTags}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          setReferenceImageUrl={setReferenceImageUrl}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        {/* Generation Result */}
        <CharacterResult
          isGenerating={isGenerating}
          resultImage={resultImage}
          currentCharacter={currentCharacter}
          isSaving={isSaving}
          onSaveToMedia={handleSaveToMedia}
          onDownload={handleDownload}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingId(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('delete_character')}
        description={t('delete_character_desc')}
        isLoading={isDeleting}
      />
    </div>
  )
}
