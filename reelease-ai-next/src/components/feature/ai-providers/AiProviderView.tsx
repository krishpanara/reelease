'use client'

import DeleteConfirmationModal from '@/components/reusable/DeleteConfirmationModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import Input from '@/components/ui/input'
import { useDeleteAIProviderMutation, useGetAIProvidersQuery } from '@/redux/api/aiProviderApi'
import { AIProvider } from '@/types'
import { Brain, Cpu, Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ProviderCard from './ProviderCard'
import ProviderForm from './ProviderForm'

const AiProviderView = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useGetAIProvidersQuery()
  const [deleteProvider, { isLoading: isDeleting }] = useDeleteAIProviderMutation()

  const providers = data?.providers || []
  const filtered = providers.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleEdit = (provider: AIProvider) => {
    setEditingProvider(provider)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingProvider(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProvider(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProvider(null)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    try {
      await deleteProvider(id).unwrap()
      toast.success(t('ai_provider_deleted_successfully'))
      setDeleteId(null)
    } catch {
      toast.error(t('ai_provider_delete_failed'))
    }
  }

  // Show form view when adding or editing
  if (showForm) {
    return <ProviderForm editingProvider={editingProvider} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        icon={<Cpu className="w-6 h-6 text-primary animate-pulse" />}
        showBackButton={false}
        title={t('ai_providers_title')}
        subtitle={t('ai_providers_desc', { defaultValue: 'Manage your AI Provider' })}
        primaryAction={{
          label: t('ai_provider_add_new'),
          onClick: handleAddNew,
          icon: <Plus className="w-4 h-4" />,
        }}
        endContent={
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('ai_provider_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/3! border-glass-border focus:ring-primary/20 rounded-xl"
            />
          </div>
        }
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">{t('loading_details')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary/50" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-foreground">{t('ai_providers_empty_title')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('ai_providers_empty_desc')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((provider) => (
            <ProviderCard
              key={provider.id || provider._id}
              provider={provider}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('ai_provider_delete_title')}
        description={t('ai_provider_delete_desc')}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default AiProviderView
