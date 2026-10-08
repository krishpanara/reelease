'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import {
  useDeleteCatalogueVideoMutation,
  useGetCatalogueVideosQuery,
} from '@/redux/api/ecommerceCatalogueApi'
import { useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

import { CatalogueEmptyState } from './CatalogueEmptyState'
import { CatalogueVideoCard } from './CatalogueVideoCard'
import { CatalogueVideoPlayer } from './CatalogueVideoPlayer'

export default function EcommerceCatalogue() {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAppSelector((state) => state.auth.user)

  // UI state
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null)
  const [playingTaskPrompt, setPlayingTaskPrompt] = useState<string | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // API hooks
  const { data: catalogueData, refetch } = useGetCatalogueVideosQuery()
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteCatalogueVideoMutation()

  const catalogueTasks = catalogueData?.data || []

  // Load active generation task from sessionStorage on mount
  useEffect(() => {
    const savedTaskId = sessionStorage.getItem('current_catalogue_task_id')
    if (savedTaskId) {
      setCurrentTaskId(savedTaskId)
    }
  }, [])

  // Socket listener for task completion
  useEffect(() => {
    if (!user) return
    const handleTaskUpdate = (payload: { taskId?: string; status?: string; message?: string }) => {
      if (payload.taskId && payload.taskId === currentTaskId) {
        refetch()
        if (payload.status === 'completed') {
          setCurrentTaskId(null)
          sessionStorage.removeItem('current_catalogue_task_id')
          toast.success(
            t('showcase_ready_toast', { defaultValue: 'Your product video showcase is generated and ready to watch!' }),
          )
        } else if (payload.status === 'failed') {
          setCurrentTaskId(null)
          sessionStorage.removeItem('current_catalogue_task_id')
          toast.error(
            payload.message ||
              t('showcase_failed_toast', { defaultValue: 'Failed to generate product showcase video' }),
          )
        }
      }
    }
    const eventName = `ai-task-${(user as { _id?: string; id?: string })._id || user.id}`
    socket.on(eventName, handleTaskUpdate)
    return () => {
      socket.off(eventName, handleTaskUpdate)
    }
  }, [user, currentTaskId, refetch, t])

  const handleGoCreate = () => {
    router.push(ROUTES.ECOMMERCE_CATALOGUE + '/create')
  }

  // Delete
  const handleDeleteTask = async () => {
    if (!confirmDeleteId) return
    try {
      await deleteVideo(confirmDeleteId).unwrap()
      toast.success(t('item_deleted_success', { defaultValue: 'Showcase item removed successfully.' }))
      refetch()
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ||
          t('delete_failed', { defaultValue: 'Failed to delete' }),
      )
    } finally {
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={t('ecommerce_catalogue', { defaultValue: 'Ecommerce Catalogue' })}
        subtitle={t('ecommerce_catalogue_subtitle', {
          defaultValue:
            'Bring your products to life with AI influencer showcase videos combining characters, products, and creative prompts.',
        })}
        showBackButton={false}
        icon={<ShoppingBag className="w-6 h-6 text-primary animate-pulse" />}
        primaryAction={{
          label: t('create_catalogue', { defaultValue: 'Create Catalogue' }),
          onClick: handleGoCreate,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <div className="space-y-6">
        {catalogueTasks.length === 0 ? (
          <CatalogueEmptyState onCreateClick={handleGoCreate} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {catalogueTasks.map((task, index) => (
              <CatalogueVideoCard
                key={task._id || task.id || index}
                task={task}
                onPlay={(url, prompt) => {
                  setPlayingVideoUrl(url)
                  setPlayingTaskPrompt(prompt)
                }}
                onDelete={(id) => setConfirmDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteTask}
        title={t('confirm_delete_title', { defaultValue: 'Delete Showcase Video?' })}
        description={t('confirm_delete_desc', { defaultValue: 'This action cannot be undone.' })}
        isLoading={isDeleting}
      />

      {playingVideoUrl && (
        <CatalogueVideoPlayer
          videoUrl={playingVideoUrl}
          prompt={playingTaskPrompt}
          onClose={() => {
            setPlayingVideoUrl(null)
            setPlayingTaskPrompt(null)
          }}
        />
      )}
    </div>
  )
}
