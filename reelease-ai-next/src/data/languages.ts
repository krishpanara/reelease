import { CheckCircle2, LayoutGrid, Monitor } from 'lucide-react'


export const languageOptions = [
  { name: 'English', locale: 'en' },
  { name: 'French', locale: 'fr' },
  { name: 'Spanish', locale: 'es' },
  { name: 'German', locale: 'de' },
  { name: 'Arabic', locale: 'ar' },
  { name: 'Portuguese', locale: 'pt' },
  { name: 'Chinese', locale: 'zh' },
  { name: 'Japanese', locale: 'ja' },
  { name: 'Russian', locale: 'ru' },
  { name: 'Hindi', locale: 'hi' },
  { name: 'Bengali', locale: 'bn' },
  { name: 'Urdu', locale: 'ur' },
  { name: 'Indonesian', locale: 'id' },
  { name: 'Turkish', locale: 'tr' },
  { name: 'Italian', locale: 'it' },
  { name: 'Vietnamese', locale: 'vi' },
  { name: 'Korean', locale: 'ko' },
  { name: 'Thai', locale: 'th' },
  { name: 'Dutch', locale: 'nl' },
  { name: 'Custom', locale: 'custom' },
]


export const translationFileOptions = [
  {
    id: 'front',
    labelKey: 'front_end_json',
    field: 'front_translation_file',
    icon: LayoutGrid,
  },
  {
    id: 'app',
    labelKey: 'app_json',
    field: 'app_translation_file',
    icon: Monitor,
  },
]

export const languageSettingsOptions = [
  { id: 'is_active', labelKey: 'active', descKey: 'enable_for_users' },
  { id: 'is_default', labelKey: 'default', descKey: 'primary_system_language' },
  { id: 'is_rtl', labelKey: 'rtl', descKey: 'right_to_left_layout' },
]

export const configurationTips = [
  { icon: CheckCircle2, textKey: 'ensure_json_keys_match_defaults' },
  { icon: CheckCircle2, textKey: 'use_high_res_flag_svg_best' },
  { icon: CheckCircle2, textKey: 'rtl_automatically_flips_layout' },
]
