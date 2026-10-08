export interface CategoryFilterProps {
  categories: any[]
  activeCategory: string
  onCategoryChange: (category: string) => void
  allLabel?: string
  nameKey?: string
  valueKey?: string // slug or id
}