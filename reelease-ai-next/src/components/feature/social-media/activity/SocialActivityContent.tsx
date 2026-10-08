'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { Pagination } from '@/components/reusable/Pagination'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import Input from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  socialPublishApi,
  useDeleteDraftMutation,
  useDeletePostMutation,
  useGetDraftsQuery,
  useGetPostHistoryQuery,
} from '@/redux/api/socialPublishApi'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ImageIcon, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CalendarFiltersDrawer } from '../calendar/CalendarFiltersDrawer'
import { PlatformFilterBar } from '../calendar/PlatformFilterBar'
import { SocialPostCard } from './SocialPostCard'
import { SocialPostReviewModal } from './SocialPostReviewModal'
import { useDebounce } from '@/hooks/useDebounce'

const SocialActivityContent = () => {
  const pageLimit = 12
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  const isDraftSelected = selectedStatus === 'draft'
  const debouncedSearch = useDebounce(search, 500)
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetPostHistoryQuery(
    {
      page,
      limit: pageLimit,
      search: debouncedSearch,
      ...(selectedPlatforms.length > 0 && { platform: selectedPlatforms.join(',') }),
      ...(selectedContentTypes.length > 0 && { content_type: selectedContentTypes.join(',') }),
      ...(selectedStatus !== 'all' && { status: selectedStatus }),
    },
    { skip: isDraftSelected },
  )

  const {
    data: draftsData,
    isLoading: isDraftsLoading,
    refetch: refetchDrafts,
  } = useGetDraftsQuery(
    {
      page,
      limit: pageLimit,
      search,
    },
    { skip: !isDraftSelected },
  )

  const isLoading = isDraftSelected ? isDraftsLoading : isHistoryLoading
  const refetch = isDraftSelected ? refetchDrafts : refetchHistory

  useEffect(() => {
    if (!user) return

    const userId = user?._id || user?.id
    if (!userId) return

    const eventName = `social-post-${userId}`

    const handlePostUpdate = (data: any) => {
      dispatch(socialPublishApi.util.invalidateTags(['SocialPost']))
      refetch()
    }

    socket.on(eventName, handlePostUpdate)

    return () => {
      socket.off(eventName, handlePostUpdate)
    }
  }, [user, dispatch, refetch])

  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation()
  const [deleteDraft, { isLoading: isDeletingDraft }] = useDeleteDraftMutation()
  const isDeleting = isDraftSelected ? isDeletingDraft : isDeletingPost

  const history = isDraftSelected
    ? (draftsData?.data || []).map((d: any) => ({
      ...d,
      status: 'draft',
    }))
    : historyData?.data || []

  const filteredHistory = history.filter((post: any) => {
    if (!filterDate) return true
    const postDate = new Date(post.scheduled_at || post.published_at || post.created_at || post.updated_at)
    const offset = postDate.getTimezoneOffset()
    const localDate = new Date(postDate.getTime() - offset * 60 * 1000)
    const postDateStr = localDate.toISOString().split('T')[0]

    const offset2 = filterDate.getTimezoneOffset()
    const localFilterDate = new Date(filterDate.getTime() - offset2 * 60 * 1000)
    const filterDateStr = localFilterDate.toISOString().split('T')[0]

    return postDateStr === filterDateStr
  })

  const pagination = isDraftSelected
    ? draftsData?.pagination || { totalPages: 1, total: 0 }
    : historyData?.pagination || { totalPages: 1, total: 0 }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      if (isDraftSelected) {
        await deleteDraft(deleteId).unwrap()
        toast.success(t('draft_deleted_successfully', { defaultValue: 'Draft deleted successfully' }))
      } else {
        const res = await deletePost(deleteId).unwrap()
        toast.success(res?.message || t('post_deleted_successfully', { defaultValue: 'Post deleted successfully' }))
      }
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_delete_post', { defaultValue: 'Failed to delete post' }))
    }
  }

  // Filter toggle functions
  const togglePlatformFilter = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
    setPage(1)
  }

  const toggleContentTypeFilter = (type: string) => {
    setSelectedContentTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
    setPage(1)
  }

  const clearAllFilters = () => {
    setSelectedPlatforms([])
    setSelectedContentTypes([])
    setSelectedStatus('all')
    setSearch('')
    setPage(1)
    setFilterDate(undefined)
  }

  // Dynamic social network direct link builder
  const getPostLink = (post: any) => {
    if (post.post_url) return post.post_url
    const postId = post.post_id || post.metadata?.postId || post.metadata?.id
    if (!postId || postId === 'PENDING') return null

    const platform = post.platform?.toLowerCase()
    const contentType = post.content_type?.toLowerCase()

    if (platform === 'facebook') return `https://facebook.com/${postId}`
    if (platform === 'instagram') {
      if (contentType === 'story') {
        const username = post.account?.account_username || post.account?.account_name
        return username ? `https://www.instagram.com/stories/${username}/${postId}/` : null
      }
      return `https://www.instagram.com/p/${postId}/`
    }
    if (platform === 'linkedin') return `https://www.linkedin.com/feed/update/urn:li:share:${postId}`
    if (platform === 'twitter' || platform === 'x') return `https://twitter.com/i/web/status/${postId}`
    if (platform === 'youtube') return `https://www.youtube.com/watch?v=${postId}`
    if (platform === 'threads') {
      const username = post.account?.account_username || post.account?.account_name
      return username ? `https://www.threads.com/@${username}/post/${postId}` : null
    }
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between ">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-100 flex-1 ">
            <Search className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-title-color pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={t('search_activity', { defaultValue: 'Search activity...' })}
              className="w-full pl-10 rtl:pr-10 ltr:pr-4 py-2 bg-white "
            />
          </div>

          {/* Date Picker Input Filter */}
          <div className="relative w-full sm:w-48">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-10 rtl:pl-10 ltr:pr-10 py-2  text-sm bg-white dark:bg-white/3 font-normal justify-start h-[40px] rounded-border-radius-inner !',
                    !filterDate && 'text-title-color',
                  )}
                >
                  <CalendarIcon className="absolute left-3.5 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-title-color pointer-events-none" />
                  {filterDate ? format(filterDate, 'PPP') : t('select_date', { defaultValue: 'Select date' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-glass-border! bg-white! dark:bg-black! rounded-border-radius overflow-hidden backdrop-blur-md"
                align="start"
              >
                <CalendarComponent
                  mode="single"
                  selected={filterDate}
                  onSelect={(date) => {
                    setFilterDate(date)
                    setPage(1)
                  }}
                  className="rounded-border-radius border border-glass-border! bg-white dark:bg-bg-madal-color text-white"
                />
              </PopoverContent>
            </Popover>
            {filterDate && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setFilterDate(undefined)
                  setPage(1)
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground hover:text-white flex items-center justify-center p-0! bg-transparent hover:bg-transparent"
                title={t('clear_date', { defaultValue: 'Clear date filter' })}
                variant="ghost"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end relative">
          <Button
            variant="outline"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`h-9 px-3 gap-2 rounded-border-radius text-xs font-bold border-white/10 ${showFiltersPanel || selectedStatus !== 'all' || selectedContentTypes.length > 0
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-white/5 text-title-color! dark:text-white! hover:bg-white/10'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {(selectedStatus !== 'all' || selectedContentTypes.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>

          {/* Floating Absolute Dropdown Drawer */}
          <CalendarFiltersDrawer
            showFiltersPanel={showFiltersPanel}
            selectedContentTypes={selectedContentTypes}
            toggleContentTypeFilter={toggleContentTypeFilter}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            showDraftsFilter={true}
          />
        </div>
      </div>

      {/* Platform Filter Options Bar */}
      <PlatformFilterBar
        selectedPlatforms={selectedPlatforms}
        togglePlatformFilter={togglePlatformFilter}
        selectedContentTypes={selectedContentTypes}
        selectedStatus={selectedStatus}
        search={search}
        clearAllFilters={clearAllFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[320px] rounded-2xl bg-white/2 border border-white/5 animate-pulse flex flex-col p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded-xl" />
              <div className="h-8 bg-white/5 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-glass-border rounded-radius bg-white  dark:bg-white/3">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-title-color mb-1">
            {filterDate
              ? t('no_posts_on_date', { defaultValue: 'No posts found on this date' })
              : t('no_activity_found', { defaultValue: 'No social activity found' })}
          </h3>
          <p className="text-base text-subtitle-color max-w-sm">
            {filterDate
              ? t('no_posts_on_date_desc', { defaultValue: 'Try selecting a different date or clearing the filter.' })
              : t('no_activity_desc', {
                defaultValue: 'Create and publish or schedule content to see publishing operations here.',
              })}
          </p>
        </div>
      ) : (
        <>
          {/* Activity Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredHistory.map((post: any) => (
              <SocialPostCard
                key={post.id || post._id}
                post={post}
                t={t}
                getPostLink={getPostLink}
                onViewDetails={setSelectedPost}
                onDelete={setDeleteId}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-between ">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                totalResults={pagination.total}
                rowsPerPage={pageLimit}
                showRowsPerPage={false}
              />
            </div>
          )}
        </>
      )}

      {/* Beautiful High-end Details/Preview Modal */}
      {selectedPost && (
        <SocialPostReviewModal
          post={selectedPost}
          t={t}
          onClose={() => setSelectedPost(null)}
          getPostLink={getPostLink}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t('delete_post_title', { defaultValue: 'Delete Social Post' })}
        description={t('delete_post_desc', {
          defaultValue:
            'Are you sure you want to delete this post? This will attempt to remove it from the social platform and your history.',
        })}
      />
    </div>
  )
}

export default SocialActivityContent
