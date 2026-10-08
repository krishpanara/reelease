'use client'

import Label from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plan, PlanAIFeaturesProps } from '@/types'
import { useTranslation } from 'react-i18next'
import { Sparkles, Image, Video, Film, Zap, BookImage, FilePlay } from 'lucide-react'
import { getFeaturesList } from '@/data/plan'



const PlanAIFeatures = ({ formData, onChange }: PlanAIFeaturesProps) => {
  const { t } = useTranslation()

const featuresList = getFeaturesList(t)

  const aiFeatures = formData.ai_features || {
    text_to_image: false,
    image_to_image: false,
    video_motion: false,
    images_to_video: false,
    text_to_video: false,
    ai_caption_generator: false,
    character_generation: false,
    ecommerce_catalogue: false,
  }

  const handleFeatureToggle = (feature: keyof NonNullable<Plan['ai_features']>, enabled: boolean) => {
    onChange('ai_features', {
      ...aiFeatures,
      [feature]: enabled,
    })
  }


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {featuresList.map((feature) => (
        <div
          key={feature.key}
          className="flex items-center justify-between p-4 rounded-border-radius border dark:border-white/10 border-black/10 transition-all duration-300 "
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-radius bg-gray-100/10 ${feature.color} group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <Label className="text-sm font-semibold cursor-pointer">{feature.label}</Label>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('ai_powered')}</span>
            </div>
          </div>
          <Switch
            checked={aiFeatures[feature.key]}
            onCheckedChange={(val) => handleFeatureToggle(feature.key, val)}
          />
        </div>
      ))}
    </div>
  )
}

export default PlanAIFeatures
