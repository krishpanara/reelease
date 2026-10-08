'use client'

import { Card } from '@/components/ui/card'
import { dashboardItemVariants } from '@/data/dashboard'
import {
  staticPromptsConfig,
  dynamicCategoriesConfig
} from '@/data/dashboard'
import { DailyPrompt } from '@/types'
import { motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DailyPromptHeader } from './DailyPromptHeader'
import { DailyPromptContent } from './DailyPromptContent'
import { DailyPromptFooter } from './DailyPromptFooter'
import { copyToClipboard } from '@/utils/clipboard'

export const DashboardDailyPrompt = () => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [keyIndex, setKeyIndex] = useState(0)

  // Localized prompts fallback list generated dynamically from staticPromptsConfig
  const promptsList: DailyPrompt[] = useMemo(
    () =>
      staticPromptsConfig.map((config) => ({
        prompt: t(config.promptKey, { defaultValue: config.defaultPrompt }),
        category: t(config.categoryKey, { defaultValue: config.defaultCategory }),
        toolName: t(config.toolNameKey, { defaultValue: config.defaultToolName }),
        toolRoute: config.toolRoute,
        icon: config.icon,
        bgGradient: config.bgGradient,
      })),
    [t]
  )

  // Initial index based on the day of the year
  const initialIndex = useMemo(() => {
    if (typeof window === 'undefined') return 0
    const today = new Date()
    const dayOfYear = today.getDate() + today.getMonth() * 31
    return dayOfYear % promptsList.length
  }, [promptsList.length])

  const [currentPrompt, setCurrentPrompt] = useState<DailyPrompt>(promptsList[initialIndex])

  const fetchRandomPrompt = async (isInitial = false) => {
    setIsLoading(true)
    if (!isInitial) {
      setIsRotating(true)
      setTimeout(() => setIsRotating(false), 600)
    }

    const randomConfig = dynamicCategoriesConfig[Math.floor(Math.random() * dynamicCategoriesConfig.length)]

    try {
      const response = await fetch('https://devtoolbox-api.devtoolbox-api.workers.dev/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: randomConfig.systemPrompt
        }),
      })

      if (!response.ok) {
        throw new Error('Keyless AI API response failed')
      }

      const data = await response.json()
      let generatedText = data.response || ''

      generatedText = generatedText.trim().replace(/^["'`]+|["'`]+$/g, '').trim()

      if (!generatedText || generatedText.length < 10) {
        throw new Error('Generated text too short or invalid')
      }

      setCurrentPrompt({
        prompt: generatedText,
        category: t(`category_${randomConfig.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, { defaultValue: randomConfig.category }),
        toolName: t(`tool_${randomConfig.toolName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, { defaultValue: randomConfig.toolName }),
        toolRoute: randomConfig.toolRoute,
        icon: randomConfig.icon,
        bgGradient: randomConfig.bgGradient
      })
      setKeyIndex((prev) => prev + 1)
      setCopied(false)
    } catch (error) {
      console.warn('Failed to fetch dynamic prompt from keyless AI API, falling back to static prompt list:', error)
      const randomIndex = Math.floor(Math.random() * promptsList.length)
      setCurrentPrompt(promptsList[randomIndex])
      setKeyIndex((prev) => prev + 1)
      setCopied(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRandomPrompt(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShuffle = () => {
    fetchRandomPrompt(false)
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(currentPrompt.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <motion.section className="h-[360px]" variants={dashboardItemVariants}>
      <Card
        className="relative h-full glass-card glass-dark-card overflow-hidden rounded-border-radius gradient-border border border-glass-border p-5 sm:p-6 flex flex-col justify-between transition-all duration-500"
      >
        {/* Soft decorative light leak background matching the prompt's theme */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none transition-all duration-700 bg-gradient-to-br ${currentPrompt.bgGradient}`}
        />

        <DailyPromptHeader
          isLoading={isLoading}
          isRotating={isRotating}
          onShuffle={handleShuffle}
        />

        <DailyPromptContent
          keyIndex={keyIndex}
          prompt={currentPrompt.prompt}
          category={currentPrompt.category}
          copied={copied}
          isLoading={isLoading}
          onCopy={handleCopy}
        />

        <DailyPromptFooter
          toolName={currentPrompt.toolName}
          toolRoute={currentPrompt.toolRoute}
          icon={currentPrompt.icon}
        />
      </Card>
    </motion.section>
  )
}
