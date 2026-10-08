'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textArea'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useGetSocialAccountsQuery } from '@/redux/api/socialApi'
import {
  useDeleteDraftMutation,
  useDeletePostMutation,
  useGetDraftByIdQuery,
  useGetPostByIdQuery,
  usePublishContentMutation,
  useSaveDraftMutation,
  useUpdateDraftMutation,
} from '@/redux/api/socialPublishApi'
import { Attachment } from '@/types'
import { format, parse } from 'date-fns'
import {
  AtSign,
  Calendar as CalendarIcon,
  CalendarRange,
  ChartNetwork,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleFadingPlus,
  Check,
  Clock,
  CloudUpload,
  Eye,
  Hash,
  Image as ImageIcon,
  Info,
  Loader2,
  Music,
  NotepadText,
  Pause,
  Play,
  Plus,
  Send,
  Smile,
  Sparkles,
  Trash2,
  Video,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChannelPreviewPlaceholder } from './ChannelPreviewPlaceholder'
import { GetCaptionModal } from './GetCaptionModal'
import { NetworkPreview } from './NetworkPreview'
import { XIcon } from '@/components/ui/XIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'

// Dynamically import emoji picker to avoid SSR/hydration issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

const timezoneOptions = [
  '(GMT+5:30) Asia/Kolkata',
  '(GMT-5:00) America/New_York',
  '(GMT+0:00) Europe/London',
  '(GMT+8:00) Asia/Singapore',
  '(GMT-8:00) America/Los_Angeles',
  '(GMT+1:00) Europe/Paris',
  '(GMT+9:00) Asia/Tokyo',
  '(GMT+10:00) Australia/Sydney',
  '(GMT-3:00) America/Sao_Paulo',
  '(GMT+4:00) Asia/Dubai'
];

const parseTimezoneOffset = (tzStr: string) => {
  const clean = tzStr.replace(/\s+/g, '')
  const match = clean.match(/GMT([+-])(\d{1,2}):(\d{2})/)
  if (match) {
    const sign = match[1]
    const hrs = match[2].padStart(2, '0')
    const mins = match[3]
    return `${sign}${hrs}:${mins}`
  }
  return undefined
}

const getPlatformStyle = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'instagram':
      return {
        bg: 'bg-gradient-to-br from-[#E4405F]/5 to-[#E4405F]/10',
        border: 'border-[#E4405F]/30',
        text: 'text-[#E4405F]',
        glow: 'shadow-[0_0_30px_rgba(228,64,95,0.12)]',
        badgeBg: 'bg-[#E4405F]/20',
        indicator: 'bg-[#E4405F]',
      }
    case 'facebook':
      return {
        bg: 'bg-gradient-to-br from-[#1877F2]/5 to-[#1877F2]/10',
        border: 'border-[#1877F2]/30',
        text: 'text-[#1877F2]',
        glow: 'shadow-[0_0_30px_rgba(24,119,242,0.12)]',
        badgeBg: 'bg-[#1877F2]/20',
        indicator: 'bg-[#1877F2]',
      }
    case 'linkedin':
      return {
        bg: 'bg-gradient-to-br from-[#0A66C2]/5 to-[#0A66C2]/10',
        border: 'border-[#0A66C2]/30',
        text: 'text-[#0A66C2]',
        glow: 'shadow-[0_0_30px_rgba(10,102,194,0.12)]',
        badgeBg: 'bg-[#0A66C2]/20',
        indicator: 'bg-[#0A66C2]',
      }
    case 'twitter':
    case 'x':
      return {
        bg: 'bg-black/[0.02] dark:bg-white/5',
        border: 'border-black/20 dark:border-white/25',
        text: 'text-black dark:text-white',
        glow: 'shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)]',
        badgeBg: 'bg-black/10 dark:bg-white/10',
        indicator: 'bg-black dark:bg-white',
      }
    case 'youtube':
      return {
        bg: 'bg-gradient-to-br from-[#FF0000]/5 to-[#FF0000]/10',
        border: 'border-[#FF0000]/30',
        text: 'text-[#FF0000]',
        glow: 'shadow-[0_0_30px_rgba(255,0,0,0.12)]',
        badgeBg: 'bg-[#FF0000]/20',
        indicator: 'bg-[#FF0000]',
      }
    case 'threads':
      return {
        bg: 'bg-black/3 dark:bg-white/5',
        border: 'border-black/20 dark:border-white/25',
        text: 'text-black dark:text-white',
        glow: 'shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)]',
        badgeBg: 'bg-black/10 dark:bg-white/10',
        indicator: 'bg-black dark:bg-white',
      }
    default:
      return {
        bg: 'bg-gradient-to-br from-primary/5 to-secondary/5',
        border: 'border-white/5',
        text: 'text-primary',
        glow: 'shadow-2xl',
        badgeBg: 'bg-primary/20',
        indicator: 'bg-primary',
      }
  }
}

export default function SocialComposer() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draftId')

  const getDefaultTime = () => {
    const d = new Date()
    d.setHours(d.getHours() + 1)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getHours())}:00`
  }

  const [caption, setCaption] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [selectedMedia, setSelectedMedia] = useState<Attachment[]>([])
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false)
  const [contentTypes, setContentTypes] = useState<string[]>(['post'])
  const [previewAccountIndex, setPreviewAccountIndex] = useState(0)

  // Scheduling states
  const [pubOption, setPubOption] = useState<'now' | 'schedule' | 'draft'>('now')
  const isScheduled = pubOption === 'schedule'
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date())
  const [scheduledTime, setScheduledTime] = useState<string>(getDefaultTime())
  const [selectedTimezone, setSelectedTimezone] = useState<string>('')
  const [timezoneDropdownOpen, setTimezoneDropdownOpen] = useState(false)

  const getTimezoneString = () => {
    try {
      const offset = -new Date().getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const pad = (num: number) => String(num).padStart(2, '0');
      const hrs = pad(Math.floor(Math.abs(offset) / 60));
      const mins = pad(Math.abs(offset) % 60);
      return `GMT ${sign}${hrs}:${mins}`;
    } catch {
      return 'GMT +00:00';
    }
  }

  // Internal notes state
  const [notes, setNotes] = useState('')

  // Emojis, Hashtags, Music and Story overlay states
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')

  const [selectedMusic, setSelectedMusic] = useState<{ name: string; url: string; serverPath?: string } | null>(null)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null)
  const [musicUrlInput, setMusicUrlInput] = useState('')

  const [storyText, setStoryText] = useState('')
  const [storyTextColor, setStoryTextColor] = useState('#ffffff')
  const [storyTextBg, setStoryTextBg] = useState('rgba(0,0,0,0.6)')
  const [storyTextSize, setStoryTextSize] = useState('md') // sm, md, lg
  const [storyTextPosition, setStoryTextPosition] = useState('center') // top, center, bottom
  const [storyBgColor, setStoryBgColor] = useState('#0f172a')
  const [manualPreviewTab, setManualPreviewTab] = useState<'feed' | 'story' | 'reel'>('feed')
  const [manualYoutubePreviewTab, setManualYoutubePreviewTab] = useState<'videos' | 'shorts'>('videos')

  // Derive the effective preview tab from selected content types
  const previewTab = useMemo<'feed' | 'story' | 'reel'>(() => {
    const activePreviewTab = manualPreviewTab === 'feed' ? 'post' : manualPreviewTab
    if (contentTypes.includes(activePreviewTab)) {
      return manualPreviewTab
    }
    if (contentTypes.includes('post')) return 'feed'
    if (contentTypes.includes('story')) return 'story'
    if (contentTypes.includes('reel')) return 'reel'
    return 'feed'
  }, [contentTypes, manualPreviewTab])

  // Derive the effective YouTube preview tab based on selected content types
  const youtubePreviewTab = contentTypes.includes('videos')
    ? contentTypes.includes('shorts')
      ? manualYoutubePreviewTab // both selected -> use manual toggle
      : 'videos' // only videos selected -> lock to videos
    : 'shorts' // only shorts selected -> lock to shorts

  const setPreviewTab = (tab: 'feed' | 'story' | 'reel') => setManualPreviewTab(tab)

  const postId = searchParams.get('postId')
  const { data: accountsData, isLoading: isLoadingAccounts } = useGetSocialAccountsQuery(undefined)
  const [publishContent, { isLoading: isPublishing }] = usePublishContentMutation()
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation()
  const { data: draftDetailData } = useGetDraftByIdQuery(draftId, { skip: !draftId })
  const { data: postDetailData } = useGetPostByIdQuery(postId, { skip: !postId })
  const [updateDraft] = useUpdateDraftMutation()
  const [deleteDraft] = useDeleteDraftMutation()
  const [deletePost] = useDeletePostMutation()

  useEffect(() => {
    if (draftDetailData?.data) {
      const draft = draftDetailData.data
      setCaption(draft.caption || '')
      setSelectedAccountIds((draft.accountIds || []).map((a: any) => a.id || a._id))
      setSelectedMedia(draft.attachmentIds || [])
      setContentTypes(draft.contentTypes || ['post'])
      setNotes(draft.notes || '')

      if (draft.metadata) {
        setStoryText(draft.metadata.storyText || '')
        setStoryTextColor(draft.metadata.storyTextColor || '#ffffff')
        setStoryTextBg(draft.metadata.storyTextBg || 'rgba(0,0,0,0.6)')
        setStoryTextSize(draft.metadata.storyTextSize || 'md')
        setStoryTextPosition(draft.metadata.storyTextPosition || 'center')
        setStoryBgColor(draft.metadata.storyBgColor || '#0f172a')
        if (draft.metadata.audioUrl) {
          setSelectedMusic({
            name: draft.metadata.audioName || 'Selected Music',
            url: draft.metadata.audioUrl,
            serverPath: draft.metadata.audioUrl,
          })
        } else {
          setSelectedMusic(null)
        }
      }

      if (draft.scheduled_at) {
        setPubOption('schedule')
        const dateObj = new Date(draft.scheduled_at)
        setScheduledDate(dateObj)
        const pad = (n: number) => n.toString().padStart(2, '0')
        setScheduledTime(`${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`)
      } else {
        setPubOption('draft')
        setScheduledDate(new Date())
        setScheduledTime(getDefaultTime())
      }
    }
  }, [draftDetailData])

  useEffect(() => {
    if (postDetailData?.data) {
      const post = postDetailData.data
      setCaption(post.caption || '')
      if (post.account) {
        setSelectedAccountIds([post.account.id || post.account._id])
      }
      const attachments = (post.media_urls || []).map((url: string, index: number) => ({
        id: `post-media-${index}-${Date.now()}`,
        name: url.split('/').pop() || 'media',
        file_path: url,
        mime_type: url.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
        file_size: 0,
      }))
      setSelectedMedia(attachments)
      setContentTypes(post.content_type ? [post.content_type] : ['post'])

      if (post.metadata) {
        setStoryText(post.metadata.storyText || '')
        setStoryTextColor(post.metadata.storyTextColor || '#ffffff')
        setStoryTextBg(post.metadata.storyTextBg || 'rgba(0,0,0,0.6)')
        setStoryTextSize(post.metadata.storyTextSize || 'md')
        setStoryTextPosition(post.metadata.storyTextPosition || 'center')
        setStoryBgColor(post.metadata.storyBgColor || '#0f172a')
        if (post.metadata.audioUrl) {
          setSelectedMusic({
            name: post.metadata.audioName || 'Selected Music',
            url: post.metadata.audioUrl,
            serverPath: post.metadata.audioUrl,
          })
        } else {
          setSelectedMusic(null)
        }
      }

      if (post.scheduled_at) {
        setPubOption('schedule')
        const dateObj = new Date(post.scheduled_at)
        setScheduledDate(dateObj)
        const pad = (n: number) => n.toString().padStart(2, '0')
        setScheduledTime(`${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`)
      }
    }
  }, [postDetailData])

  // Automatically pre-fill scheduling values when routed with a specific target calendar date
  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam && !draftId && !postId) {
      setPubOption('schedule')
      const parts = dateParam.split('-')
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        const d = parseInt(parts[2], 10)
        const parsedDate = new Date(y, m, d)
        setScheduledDate(parsedDate)
      }
    }
  }, [searchParams, draftId, postId])

  // Cleanup audio object on unmount
  useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause()
      }
    }
  }, [audioObj])

  const accounts = useMemo(() => accountsData?.data || [], [accountsData])
  const selectedAccounts = useMemo(
    () => accounts.filter((a: any) => selectedAccountIds.includes(a.id)),
    [accounts, selectedAccountIds],
  )
  const previewAccount = selectedAccounts[previewAccountIndex] || selectedAccounts[0]

  const getSupportedContentTypes = () => {
    if (selectedAccounts.length === 0) return ['post', 'story', 'reel']
    const platformTypes: Record<string, string[]> = {
      facebook: ['post', 'story', 'reel'],
      instagram: ['post', 'story', 'reel'],
      linkedin: ['post'],
      twitter: ['post', 'story', 'reel'],
      youtube: ['videos', 'shorts'],
      threads: ['post'],
    }

    const hasYoutube = selectedAccounts.some((a: any) => a.platform.toLowerCase() === 'youtube')
    const hasNonYoutube = selectedAccounts.some((a: any) => a.platform.toLowerCase() !== 'youtube')

    const supportedSet = new Set<string>()

    selectedAccounts.forEach((acc: any) => {
      const platform = acc.platform.toLowerCase()
      const allowed = platformTypes[platform] || ['post']
      allowed.forEach((type) => {
        if (type === 'videos') supportedSet.add('post')
        else if (type === 'shorts') supportedSet.add('reel')
        else supportedSet.add(type)
      })
    })

    const result = Array.from(supportedSet)

    if (hasYoutube && !hasNonYoutube) {
      return result.map((type) => {
        if (type === 'post') return 'videos'
        if (type === 'reel') return 'shorts'
        return type
      })
    }

    return result
  }

  useEffect(() => {
    const supported = getSupportedContentTypes()
    setContentTypes((prev) => {
      const getNormalizedType = (type: string) => {
        if (type === 'videos') return 'post'
        if (type === 'shorts') return 'reel'
        return type
      }

      const valid = prev
        .map((pType) => {
          const match = supported.find((sType) => getNormalizedType(sType) === getNormalizedType(pType))
          return match || null
        })
        .filter((t): t is string => t !== null)

      const uniqueValid = Array.from(new Set(valid))
      return uniqueValid.length > 0 ? uniqueValid : [supported[0]]
    })
  }, [selectedAccounts])

  const toggleAccount = (id: string) => {
    const account = accounts.find((a: any) => a.id === id)
    const isAdding = !selectedAccountIds.includes(id)
    if (isAdding && account?.platform === 'youtube') {
      const hasImages = selectedMedia.some((m) => !m.mime_type?.startsWith('video/') && m.file_type !== 'video')
      if (hasImages) {
        toast.error(
          t('youtube_only_videos', {
            defaultValue: 'YouTube only supports video uploads. Please remove any image attachments first.',
          }),
        )
        return
      }
    }
    setSelectedAccountIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
    setPreviewAccountIndex(0)
  }

  const handleSelectAll = () => {
    const hasImages = selectedMedia.some((m) => !m.mime_type?.startsWith('video/') && m.file_type !== 'video')
    const selectableAccounts = accounts.filter((acc: any) => {
      if (acc.platform === 'youtube' && hasImages) return false
      return true
    })

    const allSelectableSelected = selectableAccounts.length > 0 && selectableAccounts.every((acc: any) => selectedAccountIds.includes(acc.id))

    if (allSelectableSelected) {
      setSelectedAccountIds([])
    } else {
      setSelectedAccountIds(selectableAccounts.map((acc: any) => acc.id))
      if (accounts.some((acc: any) => acc.platform === 'youtube') && hasImages) {
        toast.info(t('youtube_skipped_images', {
          defaultValue: 'YouTube accounts skipped because images are attached.'
        }))
      }
    }
    setPreviewAccountIndex(0)
  }

  const handleMediaSelect = (attachments: Attachment | Attachment[]) => {
    const newMedia = Array.isArray(attachments) ? attachments : [attachments]

    // Separate audio files from images/videos
    const audioFiles = newMedia.filter((m) => m.file_type === 'audio' || m.mime_type?.startsWith('audio/'))
    const imageVideoFiles = newMedia.filter((m) => m.file_type !== 'audio' && !m.mime_type?.startsWith('audio/'))

    if (audioFiles.length > 0) {
      const audio = audioFiles[0]
      const localPlayUrl = audio.file_path.startsWith('http')
        ? audio.file_path
        : `/api/${audio.file_path.replace(/^\//, '')}`

      setSelectedMusic({
        name: audio.name.replace(/\.[^/.]+$/, ''),
        url: localPlayUrl,
        serverPath: audio.file_path,
      })
      toast.success(t('audio_selected_success', { defaultValue: 'Audio track selected from media library!' }))
    }

    if (imageVideoFiles.length > 0) {
      const isYoutubeSelected = selectedAccounts.some((a: any) => a.platform === 'youtube')
      let finalImageVideoFiles = imageVideoFiles
      if (isYoutubeSelected) {
        finalImageVideoFiles = imageVideoFiles.filter(
          (m) => m.mime_type?.startsWith('video/') || m.file_type === 'video',
        )
        if (imageVideoFiles.length !== finalImageVideoFiles.length) {
          toast.error(
            t('youtube_only_videos', {
              defaultValue: 'YouTube only supports video uploads. Non-video files were filtered out.',
            }),
          )
        }
      }

      if (finalImageVideoFiles.length > 0) {
        setSelectedMedia((prev) => {
          const existingIds = new Set(prev.map((m) => m.id || m._id))
          return [...prev, ...finalImageVideoFiles.filter((m) => !existingIds.has(m.id || m._id))]
        })
      }
    }
  }

  const removeMedia = (id: string) => {
    setSelectedMedia((prev) => prev.filter((m) => (m.id || m._id) !== id))
  }

  const handleAddHashtag = () => {
    const cleanTag = hashtagInput.trim().replace(/^#/, '')
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags((prev) => [...prev, cleanTag])
      setHashtagInput('')
    }
  }

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  const handlePlayPausePreset = (url: string, name: string) => {
    if (audioObj && selectedMusic?.url === url) {
      if (isPlayingMusic) {
        audioObj.pause()
        setIsPlayingMusic(false)
      } else {
        audioObj.play().catch(() => { })
        setIsPlayingMusic(true)
      }
    } else {
      if (audioObj) {
        audioObj.pause()
      }
      const newAudio = new Audio(url)
      newAudio.play().catch(() => { })
      setAudioObj(newAudio)
      // If selectedMusic was uploaded, keep its serverPath intact
      setSelectedMusic((prev) => ({
        name,
        url,
        serverPath: prev?.url === url ? prev.serverPath : undefined,
      }))
      setIsPlayingMusic(true)

      newAudio.onended = () => {
        setIsPlayingMusic(false)
      }
    }
  }

  const handleAddMusicUrl = () => {
    const trimmedUrl = musicUrlInput.trim()
    if (!trimmedUrl) {
      toast.error(t('enter_valid_audio_url', { defaultValue: 'Please enter a valid audio URL.' }))
      return
    }
    try {
      new URL(trimmedUrl)
    } catch {
      toast.error(t('invalid_url_format', { defaultValue: 'The URL you entered is not valid.' }))
      return
    }
    // Derive a display name from the URL
    const urlName =
      trimmedUrl
        .split('/')
        .pop()
        ?.split('?')[0]
        ?.replace(/\.[^/.]+$/, '') || 'Audio Track'
    setSelectedMusic({
      name: urlName,
      url: trimmedUrl,
      serverPath: trimmedUrl,
    })
    setMusicUrlInput('')
    toast.success(t('audio_url_added', { defaultValue: 'Audio URL added successfully!' }))
  }
  const handlePublish = async () => {
    if (selectedAccountIds.length === 0) {
      toast.error(t('select_at_least_one_account'))
      return
    }
    const isOnlyStory = contentTypes.length === 1 && contentTypes[0] === 'story'
    if (selectedMedia.length === 0 && !caption.trim() && !(isOnlyStory && storyText.trim())) {
      toast.error(t('add_content_to_post', { defaultValue: 'Please add a caption or media to your post' }))
      return
    }

    const toastId = toast.loading(t('preparing_media_upload', { defaultValue: 'Preparing secure media transfer...' }))
    try {
      let scheduled_at = null
      if (isScheduled) {
        const timeParts = scheduledTime.split(':')
        const finalDate = scheduledDate ? new Date(scheduledDate) : new Date()

        const year = finalDate.getFullYear()
        const month = String(finalDate.getMonth() + 1).padStart(2, '0')
        const day = String(finalDate.getDate()).padStart(2, '0')
        const hours = (timeParts[0] || '12').padStart(2, '0')
        const minutes = (timeParts[1] || '00').padStart(2, '0')

        const isoStringWithoutOffset = `${year}-${month}-${day}T${hours}:${minutes}:00`
        const tzStr = selectedTimezone || getTimezoneString()
        const offset = parseTimezoneOffset(tzStr)

        if (offset) {
          scheduled_at = new Date(`${isoStringWithoutOffset}${offset}`).toISOString()
        } else {
          finalDate.setHours(parseInt(hours, 10))
          finalDate.setMinutes(parseInt(minutes, 10))
          finalDate.setSeconds(0)
          finalDate.setMilliseconds(0)
          scheduled_at = finalDate.toISOString()
        }
      }

      // Automatically append hashtags if any are added
      let finalCaption = caption
      if (hashtags.length > 0) {
        finalCaption += '\n\n' + hashtags.map((t) => `#${t}`).join(' ')
      }

      let payload: any = {
        accountIds: selectedAccountIds,
        caption: finalCaption,
        contentTypes,
        scheduled_at,
        notes: notes || undefined,
      }

      // Add extra story customized metadata if story is selected
      if (contentTypes.includes('story')) {
        payload.storyText = storyText || undefined
        payload.storyTextColor = storyTextColor
        payload.storyTextBg = storyTextBg
        payload.storyTextSize = storyTextSize
        payload.storyTextPosition = storyTextPosition
        payload.storyBgColor = storyBgColor
      }

      if (selectedMusic) {
        payload.audioUrl = selectedMusic.serverPath || selectedMusic.url
        payload.audioName = selectedMusic.name
      }

      if (selectedMedia.length > 0) {
        const publicMediaUrls = []
        const validAttachmentIds = []

        for (const attachment of selectedMedia) {
          const isRealMongoId =
            attachment.id &&
            attachment.id.toString().length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(attachment.id.toString())

          if (isRealMongoId) {
            validAttachmentIds.push(attachment.id)
          } else if (attachment.file_path?.startsWith('http')) {
            publicMediaUrls.push(attachment.file_path)
          } else {
            console.error('Cannot process attachment without a valid ID or external URL:', attachment)
          }
        }

        if (publicMediaUrls.length > 0) {
          payload.mediaUrls = publicMediaUrls
        }
        if (validAttachmentIds.length > 0) {
          payload.attachmentIds = validAttachmentIds
        }
      }

      const actionText = isScheduled
        ? t('scheduling_content', { defaultValue: 'Scheduling content...' })
        : t('publishing_content', { defaultValue: 'Publishing to social networks...' })
      toast.loading(actionText, { id: toastId })

      await publishContent(payload).unwrap()
      if (draftId) {
        await deleteDraft(draftId).unwrap()
      }

      const successText = isScheduled
        ? t('scheduling_success', { defaultValue: 'Post scheduled successfully!' })
        : t('publishing_started')
      toast.success(successText, { id: toastId })

      setCaption('')
      setSelectedMedia([])
      setSelectedAccountIds([])
      setHashtags([])
      router.push(isScheduled ? '/social-media/scheduled' : '/social-media/activity')
      if (postId) {
        setTimeout(() => {
          deletePost(postId)
            .unwrap()
            .catch(() => { })
        }, 500)
      }
    } catch (error: any) {
      toast.error(error.data?.message || error.message || t('failed_to_publish'), { id: toastId })
    }
  }

  const handleSaveDraft = async () => {
    try {
      let scheduled_at = null
      if (isScheduled) {
        const timeParts = scheduledTime.split(':')
        const finalDate = scheduledDate ? new Date(scheduledDate) : new Date()

        const year = finalDate.getFullYear()
        const month = String(finalDate.getMonth() + 1).padStart(2, '0')
        const day = String(finalDate.getDate()).padStart(2, '0')
        const hours = (timeParts[0] || '12').padStart(2, '0')
        const minutes = (timeParts[1] || '00').padStart(2, '0')

        const isoStringWithoutOffset = `${year}-${month}-${day}T${hours}:${minutes}:00`
        const tzStr = selectedTimezone || getTimezoneString()
        const offset = parseTimezoneOffset(tzStr)

        if (offset) {
          scheduled_at = new Date(`${isoStringWithoutOffset}${offset}`).toISOString()
        } else {
          finalDate.setHours(parseInt(hours, 10))
          finalDate.setMinutes(parseInt(minutes, 10))
          finalDate.setSeconds(0)
          finalDate.setMilliseconds(0)
          scheduled_at = finalDate.toISOString()
        }
      }

      let finalCaption = caption
      if (hashtags.length > 0) {
        finalCaption += '\n\n' + hashtags.map((t) => `#${t}`).join(' ')
      }

      const draftPayload: any = {
        accountIds: selectedAccountIds,
        attachmentIds: selectedMedia.map((m) => m.id || m._id),
        caption: finalCaption,
        contentTypes,
        scheduled_at,
        notes: notes || undefined,
      }

      if (contentTypes.includes('story')) {
        draftPayload.storyText = storyText || undefined
        draftPayload.storyTextColor = storyTextColor
        draftPayload.storyTextBg = storyTextBg
        draftPayload.storyTextSize = storyTextSize
        draftPayload.storyTextPosition = storyTextPosition
        draftPayload.storyBgColor = storyBgColor
      }

      if (selectedMusic) {
        draftPayload.audioUrl = selectedMusic.serverPath || selectedMusic.url
        draftPayload.audioName = selectedMusic.name
      }

      if (draftId) {
        await updateDraft({
          draftId,
          ...draftPayload,
        }).unwrap()
        toast.success(t('draft_updated_successfully', { defaultValue: 'Draft updated successfully!' }))
      } else {
        await saveDraft(draftPayload).unwrap()
        toast.success(t('draft_saved_successfully', { defaultValue: 'Draft saved successfully!' }))
      }
      if (postId) {
        await deletePost(postId).unwrap()
      }
    } catch (error: any) {
      toast.error(error.data?.message || t('failed_to_save_draft', { defaultValue: 'Failed to save draft' }))
    }
  }

  // Get active platform details for CSS decoration
  const activePlatformStyle = previewAccount ? getPlatformStyle(previewAccount.platform) : getPlatformStyle('')

  // A draft can only be saved when there is at least some content to persist
  const canSaveDraft = caption.trim().length > 0 || selectedMedia.length > 0 || hashtags.length > 0

  const hasImagesForSelection = selectedMedia.some((m) => !m.mime_type?.startsWith('video/') && m.file_type !== 'video')
  const selectableAccounts = accounts.filter((acc: any) => {
    if (acc.platform === 'youtube' && hasImagesForSelection) return false
    return true
  })
  const allAccountsSelected = selectableAccounts.length > 0 && selectableAccounts.every((acc: any) => selectedAccountIds.includes(acc.id))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        icon={<Send className="w-6 h-6 " />}
        title={t('new_publishing_item')}
        subtitle={t('new_publishing_item_desc', {
          defaultValue: 'Create, customize and schedule posts across all your social media accounts.',
        })}
        showBackButton={false}
        endContent={
          <div className="flex items-center gap-3 lg:flex-nowrap flex-wrap lg:justify-end justify-start w-full lg:w-auto">
            <Button
              variant="ghost"
              onClick={() => router.push(ROUTES.SOCIAL_MEDIA.CALENDAR)}
              title={t('publish_calendar', { defaultValue: 'Publish Calendar' })}
              className="h-10 w-10 p-0! dark:bg-white/3! dark:text-white text-black border border-glass-border bg-black/3 hover:bg-primary hover:text-white transition-all animate-fade-in flex items-center justify-center shrink-0"
            >
              <CalendarIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={pubOption === 'draft' ? handleSaveDraft : handlePublish}
              disabled={pubOption === 'draft' ? (isSavingDraft || !canSaveDraft) : isPublishing}
              className="h-10 p-button-padding! primary-btn text-white! font-bold transition-all w-auto sm500:w-full"
            >
              {isPublishing || isSavingDraft ? (
                <Loader2 className="w-5 h-5" />
              ) : pubOption === 'draft' ? (
                <NotepadText className="w-5 h-5" />
              ) : isScheduled ? (
                <Clock className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5 " />
              )}
              {pubOption === 'draft'
                ? t('save_draft', { defaultValue: 'Save Draft' })
                : isScheduled
                  ? t('schedule_post_btn', { defaultValue: 'Schedule Post' })
                  : t('publish_now', { defaultValue: 'Publish Now' })}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Channel Selection */}
          <Card className="bg-white dark:bg-white/3 border border-glass-border  rounded-2xl overflow-hidden transition-all duration-300">
            <CardContent className="p-4 space-y-4">
              <div className="flex sm:items-center items-start justify-between flex-row">
                <div className="flex flex-col ">
                  <Label className="text-lg font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <div className="p-2 flex justify-center items-center rounded-lg bg-primary/10 text-primary">
                      <ChartNetwork className="w-4 h-4" />
                    </div>
                    {t('choose_channels', { defaultValue: 'Choose Channels' })}
                  </Label>
                  <p className="text-xs text-muted-foreground ml-10">
                    {t('choose_channels_desc', { defaultValue: 'Select one or more channels to publish this post.' })}
                  </p>
                </div>
                {/* Select All Button */}
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-lg border border-glass-border bg-transparent text-foreground hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold transition-all',
                    allAccountsSelected && 'bg-primary/5 border-primary text-primary hover:bg-primary/10',
                  )}
                >
                  <div
                    className={cn(
                      'w-3 h-3 rounded border border-muted-foreground/50 flex items-center justify-center shrink-0 transition-colors',
                      allAccountsSelected && 'bg-primary border-primary text-white',
                    )}
                  >
                    {allAccountsSelected && <Check className="w-2.5! h-2.5! stroke-[3]" />}
                  </div>
                  {allAccountsSelected
                    ? t('deselect_all', { defaultValue: 'Deselect All' })
                    : t('select_all', { defaultValue: 'Select All' })}
                </Button>
              </div>
              {isLoadingAccounts ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {accounts.map((account: any) => {
                    const isSelected = selectedAccountIds.includes(account.id)
                    const pStyle = getPlatformStyle(account.platform)
                    return (
                      <div
                        key={account.id}
                        onClick={() => toggleAccount(account.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-border-radius-inner border transition-all cursor-pointer group relative overflow-visible!',
                          isSelected
                            ? cn(pStyle?.bg, pStyle?.border, pStyle?.glow, 'scale-[1.02]')
                            : 'bg-black/3 border-glass-border hover:scale-[1.01]',
                        )}
                      >
                        <div className="relative">
                          <Avatar className="w-10 h-10 border border-white/10">
                            <AvatarImage src={account.profile_picture} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                              {account.account_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 z-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-white dark:border-zinc-950 shadow-sm p-[1.5px] overflow-hidden">
                            {account.platform === 'facebook' ? (
                              <Facebook filled={true} className="w-full h-full" />
                            ) : account.platform === 'instagram' ? (
                              <Instagram filled={true} className="w-full h-full" />
                            ) : account.platform === 'linkedin' ? (
                              <Linkedin filled={true} className="w-full h-full" />
                            ) : account.platform === 'youtube' ? (
                              <Youtube filled={true} className="w-full h-full" />
                            ) : account.platform === 'twitter' || account.platform === 'x' ? (
                              <XIcon filled={true} className="w-full h-full" />
                            ) : (
                              <ThreadsIcon filled={true} className="w-full h-full text-black dark:text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{account.account_name}</span>
                          <span className="text-xs text-muted-foreground  font-medium ">{account.platform}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-destructive text-white rounded-full z-10">
                            <Plus className="w-4 h-4 rotate-45" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caption */}
          <Card className="bg-white dark:bg-white/3 border border-glass-border  rounded-2xl overflow-hidden transition-all duration-300">
            <CardContent className="p-4 space-y-4">
              <div className="flex sm:items-center items-start justify-between flex-row">
                <div className="flex flex-col ">
                  <Label className="text-lg font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <div className="p-2 flex justify-center items-center rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold shrink-0 ">
                      <WandSparkles className="w-4 h-4" />
                    </div>
                    {t('caption', { defaultValue: 'Caption' })}
                  </Label>
                  <p className="text-xs text-muted-foreground ml-10">
                    {t('caption_desc', { defaultValue: 'Add your text, emojis, hashtags and mentions.' })}
                  </p>
                </div>
                {/* Add Template Button in top right */}
                <Button
                  onClick={() => setIsCaptionModalOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-4 gap-2 hover:bg-primary/10! text-primary hover:text-primary/90! rounded-full text-xs font-bold border border-primary/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('get_caption', { defaultValue: 'Get Caption' })}
                </Button>
              </div>

              {/* Textarea Container Box */}
              <div className="border border-glass-border rounded-border-radius-inner p-4 pb-0! px-0!  flex flex-col gap-4">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t('whats_on_your_mind', { defaultValue: "What's on your mind?" })}
                  className="w-full min-h-[120px] bg-transparent text-sm border-0 px-4! py-0!  "
                />
                <div className="flex items-center justify-between bg-subcard p-2 border-t border-glass-border ">
                  <div className="flex items-center gap-2">
                    {/* Emoji Trigger */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-primary hover:text-primary/80 transition-colors p-1.5 hover:bg-primary/5 rounded-md cursor-pointer">
                          <Smile className="w-4.5 h-4.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="p-0 border-white/10 bg-transparent rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-[280px] xs:w-[320px] sm:w-full ml-3 z-50"
                      >
                        <EmojiPicker
                          theme={'auto' as any}
                          width="100%"
                          height={400}
                          onEmojiClick={(emojiData) => setCaption((prev) => prev + emojiData.emoji)}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Hashtag trigger */}
                    <button
                      type="button"
                      onClick={() => setCaption((prev) => prev + '#')}
                      className="text-primary hover:text-primary/80 transition-colors p-1.5 hover:bg-primary/5 rounded-md cursor-pointer"
                    >
                      <Hash className="w-4.5 h-4.5" />
                    </button>

                    {/* Mention trigger */}
                    <button
                      type="button"
                      onClick={() => setCaption((prev) => prev + '@')}
                      className="text-primary hover:text-primary/80 transition-colors p-1.5 hover:bg-primary/5 rounded-md cursor-pointer"
                    >
                      <AtSign className="w-4.5 h-4.5" />
                    </button>

                    {/* AI Generate Caption trigger */}
                    {/* <button
                      type="button"
                      onClick={() => setIsCaptionModalOpen(true)}
                      className="text-primary hover:text-primary/80 transition-colors p-1.5 hover:bg-primary/5 rounded-md"
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                    </button> */}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{caption.length} / 2,200</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hashtags Section */}
          <Card className="glass-card dark:bg-white/3 border-glass-border overflow-hidden rounded-border-radius">
            <CardContent className="p-4 space-y-4">
              <Label className="text-lg font-bold flex items-center gap-2">
                <div className="p-2 flex justify-center items-center rounded-lg bg-pink-500/10 text-pink-400">
                  <Hash className="w-4 h-4" />
                </div>
                {t('hashtags', { defaultValue: 'Hashtags' })}
              </Label>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleAddHashtag()
                      }
                    }}
                    placeholder={t('add_hashtag_placeholder', { defaultValue: 'Type a hashtag and press Enter...' })}
                    className="h-11 rounded-full border-glass-border dark:bg-white/3 text-sm text-title-color"
                  />
                  <Button
                    onClick={handleAddHashtag}
                    className="h-11 rounded-full primary-btn text-white! p-button-padding! font-bold transition-all"
                  >
                    {t('add', { defaultValue: 'Add' })}
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-border-radius bg-primary/5 border border-primary/10 text-xs font-bold text-primary transition-all break-all whitespace-normal hover:bg-primary/10 cursor-default animate-fade-in"
                      >
                        #{tag}
                        <Button
                          onClick={() => handleRemoveHashtag(tag)}
                          className="text-muted-foreground cursor-pointer transition-colors bg-[unset]! p-0! hover:bg-destructive/20 "
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Music & Audio support */}
          {contentTypes.includes('story') && (
            <Card className="glass-card border-glass-border overflow-hidden rounded-border-radius dark:bg-white/3">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                      <Music className="w-4 h-4" />
                    </div>
                    {t('music_audio_support', { defaultValue: 'Music & Audio Tracks' })}
                  </Label>
                  {selectedMusic && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (audioObj) {
                          audioObj.pause()
                        }
                        setSelectedMusic(null)
                        setIsPlayingMusic(false)
                      }}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      {t('remove_music', { defaultValue: 'Remove' })}
                    </Button>
                  )}
                </div>

                {selectedMusic && (
                  <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-between gap-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
                        <Music className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t('active_track', { defaultValue: 'Selected Track' })}
                        </p>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{selectedMusic.name}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePlayPausePreset(selectedMusic.url, selectedMusic.name)}
                      className="w-10 h-10 rounded-full bg-teal-400 text-black flex items-center justify-center p-0 hover:scale-105"
                    >
                      {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                  </div>
                )}

                {!selectedMusic && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t('paste_audio_url_hint', {
                        defaultValue: 'Paste a direct link to an audio file (MP3, WAV, M4A, etc.)',
                      })}
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400/60 pointer-events-none" />
                        <Input
                          type="url"
                          value={musicUrlInput}
                          onChange={(e) => setMusicUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddMusicUrl()
                            }
                          }}
                          placeholder={t('audio_url_placeholder', { defaultValue: 'https://example.com/track.mp3' })}
                          className="h-11 pl-9 rounded-full border-glass-border dark:bg-white/3! text-sm text-title-color! placeholder:text-subtitle-color/50! focus:border-teal-500/40 focus:ring-teal-500/20"
                        />
                      </div>
                      <Button
                        onClick={handleAddMusicUrl}
                        className="h-11 p-button-padding primary-btn text-white! hover:bg-teal-400 font-bold transition-all hover:scale-[1.03]"
                      >
                        {t('add', { defaultValue: 'Add' })}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Media */}
          {/* Media */}
          <Card className="bg-white dark:bg-white/3 border border-glass-border  rounded-2xl overflow-hidden transition-all duration-300">
            <CardContent className="p-4 space-y-4">
              <div className="flex sm:items-center items-start justify-between flex-row">
                <div className="flex flex-col ">
                  <Label className="text-lg font-bold flex items-center gap-2 text-foreground dark:text-white">
                    <div className="p-2 flex justify-center items-center rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold shrink-0 ">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    {t('attached_media', { defaultValue: 'Media Attachments' })}
                  </Label>
                  <p className="text-xs text-muted-foreground ml-10">
                    {t('media_attachments_desc', { defaultValue: 'Add images, videos or GIFs to your post.' })}
                  </p>
                </div>
                {/* Media Library Button in top right */}
                <Button
                  variant="outline"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-lg border border-primary/10 bg-transparent text-primary hover:bg-primary/5 text-xs font-semibold"
                >
                  <ImageIcon className="w-4 h-4" />
                  {t('media_library', { defaultValue: 'Media Library' })}
                </Button>
              </div>
              {selectedMedia.length === 0 ? (
                <div
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="group flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-primary/20 rounded-2xl bg-primary/[0.01] hover:bg-primary/[0.02] hover:border-blue-500/40 transition-all cursor-pointer text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300">
                    <CloudUpload className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-base font-semibold text-foreground dark:text-white mb-0.5">
                    {t('drag_and_drop_media', { defaultValue: 'Drag and drop media files here' })}
                  </p>
                  <p className="text-sm text-subtitle-color mb-3">
                    {t('or_click_to_browse', { defaultValue: 'or click to browse your files' })}
                  </p>
                  <p className="text-2xs text-muted-foreground font-medium">
                    {t('supported_formats', { defaultValue: 'Supports: JPG, PNG, GIF, MP4 (Max 25MB per file)' })}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-auto no-scrollbar">
                  {selectedMedia.map((media) => (
                    <div
                      key={media.id || media._id}
                      className="relative aspect-square group rounded-border-radius overflow-hidden border border-glass-border "
                    >
                      {media.mime_type?.startsWith('video/') ? (
                        <video
                          src={
                            media.file_path.startsWith('http')
                              ? media.file_path
                              : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${media.file_path.replace(/^\//, '')}`
                          }
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause()
                            e.currentTarget.currentTime = 0
                          }}
                        />
                      ) : (
                        <Image
                          src={
                            media.file_path.startsWith('http')
                              ? media.file_path
                              : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${media.file_path.replace(/^\//, '')}`
                          }
                          alt={media.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <Button
                        onClick={() => removeMedia((media.id || media._id) as string)}
                        className="absolute top-2 right-2 p-0! rounded-lg bg-destructive! h-[unset]! text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="aspect-square w-full h-full! p-0 flex flex-col items-center justify-center rounded-border-radius border-2 border-dashed border-glass-border bg-white/3 hover:bg-white/5  transition-all group"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-base  font-bold text-muted-foreground group-hover:text-primary transition-colors mt-1">
                      {t('add_image', { defaultValue: 'Add Image' })}
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publishing Formats (Content Types) */}
          {getSupportedContentTypes().length > 1 && (
            <Card className="glass-card border-glass-border overflow-hidden rounded-border-radius dark:bg-white/3">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <CircleFadingPlus className="w-5 h-5" />
                    </div>
                    {t('content_types', { defaultValue: 'Publishing Formats' })}
                  </Label>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-white/5 bg-black/3 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)] backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className=" absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                    </span>
                    <span className="text-xs font-bold text-title-color">
                      {contentTypes.length} <span className="text-muted-foreground font-normal">{t('selected')}</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {getSupportedContentTypes().map((type) => {
                    const isSelected = contentTypes.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setContentTypes((prev) =>
                            prev.includes(type)
                              ? prev.length > 1
                                ? prev.filter((t) => t !== type)
                                : prev
                              : [...prev, type],
                          )
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-3.5 rounded-border-radius-inner border transition-all gap-1.5 duration-300 font-bold hover:scale-[1.02] cursor-pointer',
                          isSelected
                            ? 'bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent border-primary/40 text-primary backdrop-blur-md'
                            : 'bg-black/3 border-glass-border text-muted-foreground',
                        )}
                      >
                        {(type === 'post' || type === 'videos') && <ImageIcon className="w-7 h-7" />}
                        {type === 'story' && <Sparkles className="w-7 h-7" />}
                        {(type === 'reel' || type === 'shorts') && <Video className="w-7 h-7" />}
                        <span className="text-base font-medium capitalize">
                          {type === 'reel' || type === 'shorts'
                            ? selectedAccounts.some((a: any) => a.platform === 'youtube')
                              ? t('shorts', { defaultValue: 'Shorts' })
                              : t('reel', { defaultValue: 'Reel' })
                            : type === 'post' || type === 'videos'
                              ? selectedAccounts.some((a: any) => a.platform === 'youtube')
                                ? t('videos', { defaultValue: 'Videos' })
                                : t('post', { defaultValue: 'Post' })
                              : t(type, { defaultValue: type })}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Story Customization section */}
          {contentTypes.includes('story') && (
            <Card className="glass-card border-glass-border overflow-hidden rounded-border-radius dark:bg-white/3 animate-in slide-in-from-top-4 duration-300">
              <CardContent className="p-4 space-y-4">
                <Label className="text-lg font-bold flex items-center gap-2">
                  <div className="w-10 h-10 flex justify-center items-center rounded-lg bg-pink-500/10 text-pink-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {t('story_customization', { defaultValue: 'Story Customization' })}
                </Label>
                <div className="space-y-6">
                  {/* 1. Text Overlay – first */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        {t('story_text', { defaultValue: 'Text Overlay' })}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0! h-0! bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
                          >
                            <Smile className="w-3.5 h-3.5 text-subtitle-color" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="p-0 border-white/10 bg-transparent rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-[380px]"
                        >
                          <EmojiPicker
                            theme={'auto' as any}
                            width="100%"
                            height={400}
                            onEmojiClick={(emojiData) => setStoryText((prev) => prev + emojiData.emoji)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      placeholder={t('enter_story_text', { defaultValue: 'Type text to overlay on your story...' })}
                      className="h-11 rounded-full dark:bg-white/3 border-glass-border text-sm text-subtitle-color"
                    />
                  </div>

                  {/* 2. Story Background | Text Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                        {t('story_background', { defaultValue: 'Story Background' })}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: '#0f172a', name: 'Dark', gradient: 'linear-gradient(to right, #0f172a, #1e293b)' },
                          { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(to right, #f43f5e, #f97316)' },
                          { id: 'indigo', name: 'Indigo', gradient: 'linear-gradient(to right, #1e1b4b, #4f46e5)' },
                          { id: 'violet', name: 'Violet', gradient: 'linear-gradient(to right, #7c3aed, #db2777)' },
                          { id: 'emerald', name: 'Emerald', gradient: 'linear-gradient(to right, #064e3b, #059669)' },
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => setStoryBgColor(bg.id)}
                            className={cn(
                              'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
                              storyBgColor === bg.id
                                ? 'border-white text-white ring-2 ring-white/20 dark:ring-glass-border!'
                                : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white',
                            )}
                            style={{ background: bg.gradient }}
                          >
                            {bg.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                        {t('text_color', { defaultValue: 'Text Color' })}
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {['#ffffff', '#ff007f', '#00e5ff', '#ffeb3b', '#00ff66'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setStoryTextColor(c)}
                            className={cn(
                              'w-8 h-8 rounded-full border border-white/20 transition-all shrink-0',
                              storyTextColor === c && 'ring-2 ring-primary',
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Text Background | Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                        {t('text_background', { defaultValue: 'Background' })}
                      </Label>
                      <div className="flex gap-1.5 p-2 rounded-full dark:bg-white/3 border border-glass-border">
                        {['rgba(0,0,0,0.6)', 'rgba(255,255,255,0.6)', 'transparent'].map((bg) => (
                          <Button
                            key={bg}
                            onClick={() => setStoryTextBg(bg)}
                            className={cn(
                              'flex-1 py-1 h-10 text-xs rounded transition-all text-title-color!',
                              storyTextBg === bg && 'primary-btn text-white! font-bold',
                            )}
                          >
                            {bg === 'transparent' ? 'None' : bg.includes('0,0,0') ? 'Dark' : 'Light'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-subtitle-color mb-2 block">
                        {t('text_size', { defaultValue: 'Size' })}
                      </Label>
                      <div className="flex gap-1.5 p-2 rounded-full dark:bg-white/3 border border-glass-border">
                        {['sm', 'md', 'lg'].map((sz) => (
                          <Button
                            key={sz}
                            onClick={() => setStoryTextSize(sz)}
                            className={cn(
                              'flex-1 py-1 h-10 text-xs uppercase rounded transition-all',
                              storyTextSize === sz
                                ? 'primary-btn text-white! font-bold'
                                : 'text-title-color! bg-black/3',
                            )}
                          >
                            {sz}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. Position – full width */}
                  <div className="w-full">
                    <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      {t('text_position', { defaultValue: 'Position' })}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  2xl:grid-cols-7 gap-2 p-2 2xl:rounded-full rounded-border-radius-inner dark:bg-white/3 border border-glass-border">
                      {['top', 'top-left', 'top-right', 'center', 'bottom', 'bottom-left', 'bottom-right'].map(
                        (pos) => (
                          <Button
                            key={pos}
                            onClick={() => setStoryTextPosition(pos)}
                            className={cn(
                              'text-xs font-bold capitalize rounded transition-all truncate px-2 py-2',
                              storyTextPosition === pos
                                ? 'primary-btn text-white! font-black'
                                : 'text-title-color! bg-black/2 dark:bg-white/3  hover:bg-white/5',
                            )}
                          >
                            {pos.replace('-', ' ')}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Options */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-white/3 border border-glass-border rounded-2xl overflow-hidden transition-all duration-300">
              <CardContent className="p-5 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="p-2 flex justify-center items-center rounded-xl bg-primary/10 text-primary">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-title-color dark:text-white">
                      {t('publishing_options_title', { defaultValue: 'Publishing Options' })}
                    </h3>
                    <p className="text-xs text-subtitle-color font-medium">
                      {t('publishing_options_desc', { defaultValue: 'Choose how and when to publish this post.' })}
                    </p>
                  </div>
                </div>

                {/* Tabs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'now',
                      title: t('publish_now', { defaultValue: 'Publish Now' }),
                      desc: t('publish_now_desc', { defaultValue: 'Publish immediately' }),
                      icon: <Send className="w-4 h-4" />,
                    },
                    {
                      id: 'schedule',
                      title: t('schedule', { defaultValue: 'Schedule' }),
                      desc: t('schedule_desc', { defaultValue: 'Pick a date and time' }),
                      icon: <CalendarIcon className="w-4 h-4" />,
                    },
                    {
                      id: 'draft',
                      title: t('draft', { defaultValue: 'Draft' }),
                      desc: t('draft_desc', { defaultValue: 'Save as draft' }),
                      icon: <NotepadText className="w-4 h-4" />,
                    },
                  ].map((option) => {
                    const isActive = pubOption === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPubOption(option.id as any)}
                        className={cn(
                          "relative flex items-center gap-3.5 p-4 rounded-border-radius-inner border text-left cursor-pointer transition-all duration-300 select-none outline-none w-full",
                          isActive
                            ? "bg-primary/5 dark:bg-primary/10 border-primary text-primary!  shadow-sm"
                            : "bg-subcard dark:bg-white/3  border-glass-border text-subtitle-color hover:border-slate-300/80 dark:hover:border-white/10 hover:text-title-color dark:hover:text-white font-medium"
                        )}
                      >
                        <div className={cn(
                          "p-2.5 rounded-lg shrink-0",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-slate-200 dark:bg-white/5 text-subtitle-color"
                        )}>
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className={cn(
                            "text-base font-bold truncate leading-snug",
                            isActive ? "text-title-color" : "text-title-color! dark:text-white"
                          )}>
                            {option.title}
                          </h4>
                          <p className="text-xs text-subtitle-color  leading-normal truncate mt-0.5">
                            {option.desc}
                          </p>
                        </div>
                        {isActive && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Scheduling Config Fields */}
                {pubOption === 'schedule' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Date Picker Button */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-subtitle-color">
                        {t('date', { defaultValue: 'Date' })}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full min-h-[44px] items-center justify-start text-left font-normal rounded-border-radius-inner hover:bg-slate-50 dark:hover:bg-white/5 bg-transparent border-slate-200/60 dark:border-white/10 transition-all px-4"
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 text-primary opacity-80 shrink-0" />
                            <span className="font-semibold text-sm text-title-color dark:text-white">
                              {scheduledDate ? format(scheduledDate, 'MMM d, yyyy') : t('select_date', { defaultValue: 'Select Date' })}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 border-slate-200 dark:border-white/10 bg-white dark:bg-black/95 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="p-3 border-none bg-transparent"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Picker Popover */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-subtitle-color">
                        {t('time', { defaultValue: 'Time' })}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full min-h-[44px] items-center justify-start text-left font-normal rounded-border-radius-inner hover:bg-slate-50 dark:hover:bg-white/5 bg-transparent border-slate-200/60 dark:border-white/10 transition-all px-4"
                          >
                            <Clock className="mr-3 h-4 w-4 text-primary opacity-80 shrink-0" />
                            <span className="font-semibold text-sm text-title-color dark:text-white">
                              {(() => {
                                if (!scheduledTime) return ''
                                const [hStr, mStr] = scheduledTime.split(':')
                                const h = parseInt(hStr, 10)
                                const ampm = h >= 12 ? 'PM' : 'AM'
                                const h12 = h % 12 || 12
                                return `${String(h12).padStart(2, '0')}:${mStr} ${ampm}`
                              })()}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 border-slate-200 dark:border-white/10 bg-white dark:bg-black/95 rounded-xl shadow-2xl backdrop-blur-md z-50">
                          {(() => {
                            const [hStr, mStr] = scheduledTime.split(':')
                            const currentH24 = parseInt(hStr, 10)
                            const currentH12 = currentH24 % 12 || 12
                            const currentM = parseInt(mStr, 10)
                            const currentAmpm = currentH24 >= 12 ? 'PM' : 'AM'

                            const handleTimeChange = (newH12: number, newM: number, newAmpm: string) => {
                              let h24 = newH12
                              if (newAmpm === 'PM' && newH12 < 12) h24 += 12
                              if (newAmpm === 'AM' && newH12 === 12) h24 = 0
                              const h24Str = String(h24).padStart(2, '0')
                              const mStrVal = String(newM).padStart(2, '0')
                              setScheduledTime(`${h24Str}:${mStrVal}`)
                            }

                            return (
                              <div className="space-y-4">
                                <div className="text-center font-bold text-sm text-title-color dark:text-white border-b border-slate-100 dark:border-white/5 pb-2">
                                  Select Time
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                  {/* Hours Column */}
                                  <div className="flex flex-col items-center w-1/3">
                                    <span className="text-[10px] uppercase font-bold text-subtitle-color mb-1.5">Hour</span>
                                    <div className="h-40 overflow-y-auto w-full pr-1 no-scrollbar scroll-smooth">
                                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                                        const isSel = currentH12 === h
                                        return (
                                          <button
                                            key={h}
                                            type="button"
                                            onClick={() => handleTimeChange(h, currentM, currentAmpm)}
                                            className={cn(
                                              "w-full py-1 text-sm font-semibold rounded-[6px] text-center my-0.5 transition-all cursor-pointer",
                                              isSel
                                                ? "bg-primary text-white font-bold"
                                                : "text-title-color dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                          >
                                            {String(h).padStart(2, '0')}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* Minutes Column */}
                                  <div className="flex flex-col items-center w-1/3">
                                    <span className="text-[10px] uppercase font-bold text-subtitle-color mb-1.5">Min</span>
                                    <div className="h-40 overflow-y-auto w-full pr-1 no-scrollbar">
                                      {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                                        const isSel = currentM === m
                                        return (
                                          <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleTimeChange(currentH12, m, currentAmpm)}
                                            className={cn(
                                              "w-full py-1 text-sm font-semibold rounded-[6px] text-center my-0.5 transition-all cursor-pointer",
                                              isSel
                                                ? "bg-primary text-white font-bold"
                                                : "text-title-color dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                          >
                                            {String(m).padStart(2, '0')}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* AM/PM Column */}
                                  <div className="flex flex-col items-center w-1/3 gap-1.5">
                                    <span className="text-[10px] uppercase font-bold text-subtitle-color mb-0.5">AM/PM</span>
                                    {['AM', 'PM'].map((ampm) => {
                                      const isSel = currentAmpm === ampm
                                      return (
                                        <button
                                          key={ampm}
                                          type="button"
                                          onClick={() => handleTimeChange(currentH12, currentM, ampm)}
                                          className={cn(
                                            "w-full py-1.5 text-xs font-bold rounded-[6px] text-center transition-all cursor-pointer",
                                            isSel
                                              ? "bg-primary text-white font-extrabold shadow-sm"
                                              : "text-title-color dark:text-white bg-slate-50 dark:bg-white/3 hover:bg-slate-100 dark:hover:bg-white/5"
                                          )}
                                        >
                                          {ampm}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Timezone Select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-subtitle-color">
                        {t('timezone', { defaultValue: 'Timezone' })}
                      </Label>
                      <Popover open={timezoneDropdownOpen} onOpenChange={setTimezoneDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full min-h-[44px] items-center justify-between text-left font-normal rounded-border-radius-inner hover:bg-slate-50 dark:hover:bg-white/5 bg-transparent border-slate-200/60 dark:border-white/10 transition-all px-4"
                          >
                            <div className="flex items-center truncate">
                              <ChartNetwork className="mr-3 h-4 w-4 text-primary opacity-80 shrink-0" />
                              <span className="font-semibold text-sm text-title-color dark:text-white truncate">
                                {selectedTimezone || getTimezoneString()}
                              </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-subtitle-color shrink-0 ml-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-1 bg-white dark:bg-black/95 border-slate-200 dark:border-white/10 rounded-xl shadow-2xl backdrop-blur-md z-50 max-h-[300px] overflow-y-auto no-scrollbar">
                          {timezoneOptions.map((opt) => (
                            <Button
                              key={opt}
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setSelectedTimezone(opt)
                                setTimezoneDropdownOpen(false)
                              }}
                              className={cn(
                                'w-full justify-start text-left text-xs font-semibold px-3 py-2 rounded-lg mb-0.5 last:mb-0 h-auto cursor-pointer',
                                (selectedTimezone || getTimezoneString()) === opt
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-title-color/80 dark:text-white/70 hover:text-title-color dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                              )}
                            >
                              {opt}
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internal Remarks Card */}
            <Card className="bg-white dark:bg-white/3 border border-glass-border rounded-2xl overflow-hidden transition-all duration-300">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2.5 pb-2">
                  <div className="p-2 flex justify-center items-center rounded-xl bg-primary/10 text-primary">
                    <NotepadText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-title-color dark:text-white">
                      {t('internal_notes', { defaultValue: 'Internal Remarks' })}
                    </h3>
                    <p className="text-xs text-subtitle-color font-medium">
                      {t('internal_notes_description', { defaultValue: 'Add any team notes or specific instructions here' })}
                    </p>
                  </div>
                </div>
                <Textarea
                  className="min-h-[44px] border-slate-200/60 dark:border-white/10 transition-all"
                  value={notes}
                  placeholder={t('internal_notes_placeholder', { defaultValue: 'Approval notes, coordination reminders...' })}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Network Preview Sidebar with Customized Platform Colors and Repositioned Tabs */}
        <div className="xl:col-span-4 sticky top-20">
          <Card className="bg-white dark:bg-white/3 border border-glass-border  rounded-2xl overflow-hidden transition-all duration-500 ">
            <div className="sm:p-5 gap-[6px] p-4 pb-0 flex items-center justify-between">
              <Label className="text-lg font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Eye className="w-5 h-5" />
                </div>
                {t('network_preview', { defaultValue: 'Channel Preview' })}
              </Label>
              {selectedAccounts.length > 1 && (
                <div className="flex items-center gap-1 bg-black/3 border border-glass-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewAccountIndex((i) => Math.max(0, i - 1))}
                    disabled={previewAccountIndex === 0}
                    className="h-6 w-6 p-0 rounded-lg "
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-3xs text-muted-foreground font-bold">
                    {previewAccountIndex + 1}/{selectedAccounts.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewAccountIndex((i) => Math.min(selectedAccounts.length - 1, i + 1))}
                    disabled={previewAccountIndex === selectedAccounts.length - 1}
                    className="h-6 w-6 p-0 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-4 pt-0!">
              {/* Main Preview Container */}
              {selectedAccountIds.length === 0 ? (
                <ChannelPreviewPlaceholder
                  message={t('preview_not_ready', {
                    defaultValue: 'Select a channel to view a live preview.',
                  })}
                />
              ) : (
                <div className="relative">
                  {/* Dynamic Format Toggle for Meta Accounts (Story / Feed / Reel) */}
                  {(() => {
                    if (!previewAccount) return null
                    const platform = previewAccount.platform.toLowerCase()
                    const platformSupported: Record<string, string[]> = {
                      facebook: ['post', 'story', 'reel'],
                      instagram: ['post', 'story', 'reel'],
                      linkedin: ['post'],
                      twitter: ['post', 'story', 'reel'],
                      threads: ['post'],
                    }
                    const allowed = platformSupported[platform] || ['post']
                    const visibleFormats = contentTypes.filter(
                      (type) => allowed.includes(type) && ['post', 'story', 'reel'].includes(type),
                    )

                    if (visibleFormats.length <= 1) return null

                    return (
                      <div className="flex justify-center mb-3">
                        <div className="flex p-0.5 rounded-full  border border-glass-border gap-2 text-md font-bold">
                          {visibleFormats.includes('post') && (
                            <Button
                              onClick={() => setPreviewTab('feed')}
                              className={cn(
                                'px-2.5 py-1 h-8 rounded transition-all',
                                previewTab === 'feed'
                                  ? 'primary-btn text-white!'
                                  : 'text-title-color! dark:bg-white/3! bg-black/3!',
                              )}
                            >
                              {t('feed_post', { defaultValue: 'Feed Post' })}
                            </Button>
                          )}
                          {visibleFormats.includes('story') && (
                            <Button
                              onClick={() => setPreviewTab('story')}
                              className={cn(
                                'px-2.5 py-1 h-8 rounded transition-all',
                                previewTab === 'story'
                                  ? 'primary-btn text-white!'
                                  : 'text-title-color! dark:bg-white/3! bg-black/3!',
                              )}
                            >
                              {t('story', { defaultValue: 'Story' })}
                            </Button>
                          )}
                          {visibleFormats.includes('reel') && (
                            <Button
                              onClick={() => setPreviewTab('reel')}
                              className={cn(
                                'px-2.5 py-1 h-8 rounded transition-all',
                                previewTab === 'reel'
                                  ? 'primary-btn text-white!'
                                  : 'text-title-color! dark:bg-white/3! bg-black/3!',
                              )}
                            >
                              {t('reel', { defaultValue: 'Reel' })}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Dynamic Format Toggle for YouTube (Video / Shorts) */}
                  {previewAccount?.platform?.toLowerCase() === 'youtube' &&
                    contentTypes.includes('videos') &&
                    contentTypes.includes('shorts') && (
                      <div className="flex justify-center mb-3">
                        <div className="flex p-0.5 rounded-full dark:bg-white/3 bg-black/3 border border-glass-border gap-1 text-[10px] font-bold uppercase tracking-wider">
                          <Button
                            onClick={() => setManualYoutubePreviewTab('videos')}
                            className={cn(
                              'px-2.5 py-1 h-8 rounded transition-all',
                              youtubePreviewTab === 'videos'
                                ? 'primary-btn text-white!'
                                : 'text-black! dark:text-white! bg-[unset]! hover:text-white',
                            )}
                          >
                            {t('video', { defaultValue: 'Video' })}
                          </Button>
                          <Button
                            onClick={() => setManualYoutubePreviewTab('shorts')}
                            className={cn(
                              'px-2.5 py-1 h-8 rounded transition-all',
                              youtubePreviewTab === 'shorts'
                                ? 'primary-btn text-white!'
                                : 'text-black! dark:text-white! bg-[unset]! hover:text-white',
                            )}
                          >
                            {t('shorts', { defaultValue: 'Shorts' })}
                          </Button>
                        </div>
                      </div>
                    )}

                  <NetworkPreview
                    account={previewAccount}
                    caption={caption + (hashtags.length > 0 ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ') : '')}
                    mediaList={selectedMedia}
                    storyText={storyText}
                    storyTextColor={storyTextColor}
                    storyTextBg={storyTextBg}
                    storyTextSize={storyTextSize}
                    storyTextPosition={storyTextPosition}
                    storyBgColor={storyBgColor}
                    selectedMusic={selectedMusic}
                    activeTab={previewTab}
                    platformStyle={activePlatformStyle}
                    contentType={
                      previewAccount?.platform?.toLowerCase() === 'youtube' ? youtubePreviewTab : contentTypes[0]
                    }
                  />
                </div>
              )}

              {/* Repositioned Channels Tab BELOW the Preview Card to look premium & highly original */}
              {selectedAccounts.length > 1 && (
                <div className="pt-4 border-t border-white/5 dark:border-white/3 space-y-2">
                  <p className="text-base text-muted-foreground">
                    {t('select_account_preview', { defaultValue: 'Switch Preview Account' })}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedAccounts.map((acc: any, i: number) => {
                      const isActive = previewAccountIndex === i
                      const accStyle = getPlatformStyle(acc.platform)
                      return (
                        <Button
                          key={acc.id}
                          onClick={() => setPreviewAccountIndex(i)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-base font-bold border transition-all relative overflow-hidden flex items-center gap-1.5',
                            isActive
                              ? cn('bg-primary/10! text-title-color!  border-primary/30', accStyle.border)
                              : 'bg-black/40 dark:bg-white/3! text-subtitle-color! hover:bg-black/60 border-glass-border',
                          )}
                        >
                          {isActive && (
                            <span className={cn('w-2 h-2 rounded-full animate-pulse', accStyle.indicator)}></span>
                          )}
                          {acc.account_name}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 p-3 rounded-border-radius bg-priamry/5 border border-primary/10 text-[10px] text-primary">
                <Info className="w-6 h-6" />
                <p className="text-sm">
                  {t('preview_disclaimer', {
                    defaultValue: 'Preview based on the selected profile Final appearance may vary by platform. ',
                  })}
                  {t('preview_disclaimer_desc', {
                    defaultValue: 'Final appearance may vary by platform.',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiSelect={true}
        type={selectedAccounts.some((a: any) => a.platform === 'youtube') ? 'video' : 'all'}
      />
      <GetCaptionModal
        isOpen={isCaptionModalOpen}
        onClose={() => setIsCaptionModalOpen(false)}
        onSelect={(cap) => setCaption((prev) => (prev ? prev + '\n\n' + cap : cap))}
        platform={
          selectedAccountIds.length > 0
            ? accounts.find((a: any) => a.id === selectedAccountIds[0])?.platform
            : 'instagram'
        }
      />
    </div>
  )
}
