import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { PromptLibraryToolbarProps } from '@/types/components/ai-prompts'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PromptLibraryToolbar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
  onResetPage,
}: PromptLibraryToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="flex lg991:flex-col gap-3">
      <div className="relative flex-1 sm:min-w-[500px] max-w-[500px] ">
        <Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            onResetPage()
          }}
          placeholder={t('search_prompts', { defaultValue: 'Search prompts...' })}
          className="pl-9 rtl:pr-9 "
        />
        {search && (
          <Button
            onClick={() => {
              setSearch('')
              onResetPage()
            }}
            className="absolute bg-[unset]! right-3 rtl:left-3 rtl:right-auto p-0! top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
        <div className="flex overflow-x-auto gap-2 no-scrollbar snap-x w-full">
          <Button
            onClick={() => {
              setCategoryFilter('')
              onResetPage()
            }}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border dark:bg-white/5! bg-black/3 dark:text-white/50 transition-all font-medium ${
              !categoryFilter
                ? 'bg-primary text-primary! border-primary'
                : 'border-border text-subtitle-color! hover:border-primary/40'
            }`}
          >
            {t('all', { defaultValue: 'All' })}
          </Button>
          {categories?.map((cat: string) => (
            <Button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat === categoryFilter ? '' : cat)
                onResetPage()
              }}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all  font-medium ${
                categoryFilter === cat
                  ? 'bg-primary text-primary! border-primary'
                  : 'border-glass-border   dark:bg-white/5! bg-black/3 text-subtitle-color!'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
