import { BookOpen, Tag, Sparkles } from 'lucide-react'

export const promptStatsConfig = [
  { 
    id: 'total',
    icon: BookOpen, 
    labelKey: 'total_prompts', 
    valueKey: 'total', 
    defaultLabel: 'Total Prompts' 
  },
  { 
    id: 'categories',
    icon: Tag, 
    labelKey: 'categories', 
    valueKey: 'categoriesCount', 
    defaultLabel: 'Categories' 
  },
  { 
    id: 'showing',
    icon: Sparkles, 
    labelKey: 'this_page', 
    valueKey: 'currentPageCount', 
    defaultLabel: 'Showing' 
  },
]
