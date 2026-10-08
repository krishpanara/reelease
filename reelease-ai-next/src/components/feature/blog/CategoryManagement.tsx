'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import Spinner from '@/components/reusable/Spinner'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input'
import { useAppDirection } from '@/hooks/useAppDirection'
import { cn } from '@/lib/utils'
import { useDeleteCategoryMutation, useGetCategoriesQuery } from '@/redux/api/categoryApi'
import { Category } from '@/types'
import { ChevronDown, ChevronRight, FolderTree, Plus, Search, Trash2 } from 'lucide-react'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import CategoryForm from './CategoryForm'

const CategoryManagement = forwardRef(
  (
    {
      search,
      onSearchChange,
      canManageBlogs,
    }: { search: string; onSearchChange: (val: string) => void; canManageBlogs: boolean },
    ref: any,
  ) => {
    const { t } = useTranslation()
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [localSearch, setLocalSearch] = useState('')
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
    const direction = useAppDirection()
    const isRtl = direction === 'rtl'

    // Fetch full tree - remove limit to trigger tree logic in backend
    const { data: categoriesResponse, isLoading, refetch } = useGetCategoriesQuery({ search: '' })
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

    const treeData = categoriesResponse?.categories || []
    const activeSearch = search || localSearch

    // Flatten tree for the Select dropdown in CategoryForm
    const flattenCategories = (nodes: any[], list: any[] = []) => {
      nodes.forEach((node) => {
        // Add node if not already in list (though shouldn't happen in tree)
        list.push(node)
        if (node.children && node.children.length > 0) {
          flattenCategories(node.children, list)
        }
      })
      return list
    }
    const flatCategories = flattenCategories(treeData)

    useImperativeHandle(ref, () => ({
      handleCreate: () => {
        setSelectedCategory(null)
      },
    }))

    const handleDeleteConfirm = async () => {
      if (!categoryToDelete) return
      try {
        await deleteCategory(categoryToDelete).unwrap()
        toast.success(t('category_deleted_successfully'))
        setIsDeleteModalOpen(false)
        setCategoryToDelete(null)
        if (selectedCategory?._id === categoryToDelete || selectedCategory?.id === categoryToDelete) {
          setSelectedCategory(null)
        }
      } catch (error: any) {
        toast.error(error?.data?.message || t('something_went_wrong'))
      }
    }

    const toggleExpand = (id: string) => {
      setExpandedNodes((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }))
    }

    const renderTree = (nodes: any[], depth = 0) => {
      return nodes
        .filter((node) => !activeSearch || node.name.toLowerCase().includes(activeSearch.toLowerCase()))
        .map((node) => {
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = expandedNodes[node._id]
          const isSelected = selectedCategory?._id === node._id

          return (
            <div key={node._id} className="flex flex-col">
              <div
                className={cn(
                  'group flex items-center gap-2 p-2 rounded-xl transition-all duration-200 cursor-pointer mb-1 dark:bg-white/5 bg-black/5',
                  isSelected ? 'bg-primary/20 text-black!' : 'dark:hover:bg-white/10 hover:bg-primary/10 ',
                )}
                style={isRtl ? { marginRight: `${depth * 20}px` } : { marginLeft: `${depth * 20}px` }}
                onClick={() => setSelectedCategory(node)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {hasChildren ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(node._id)
                      }}
                      className="p-0! h-0! transition-colors text-subtitle-color!"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  ) : (
                    <div className="w-5.5" />
                  )}

                  <FolderTree
                    className={cn('w-4 h-4 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
                  />
                  <span
                    className={cn(
                      'text-sm truncate',
                      isSelected ? 'font-bold dark:text-white text-primary' : 'text-subtitle-color',
                    )}
                  >
                    {node.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCategoryToDelete(node._id)
                      setIsDeleteModalOpen(true)
                    }}
                  >
                    <Trash2 className="h-3.5" />
                  </Button>
                </div>
              </div>

              {hasChildren && isExpanded && <div className="flex flex-col">{renderTree(node.children, depth + 1)}</div>}
            </div>
          )
        })
    }

    return (
      <div className=" grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Left Column: Category Tree */}
        <div className="col-span-12 xl:col-span-3">
          <div className=" border border-glass-border dark:bg-white/3 bg-white backdrop-blur-md rounded-border-radius sm:p-6 p-4 flex flex-col h-fit ">
            <div className="flex justify-between mb-3">
              <h3 className="font-bold text-lg mb-6 ">{t('category')}</h3>
              {canManageBlogs && (
                <Button
                  onClick={() => ref?.current?.handleCreate()}
                  className="h-10! w-10! p-0!  text-sm font-medium text-white! primary-btn leading-0 gap-1.5 transition-all duration-300"
                >
                  <div className="opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden me-0 ">
                    <Plus className="w-5 h-5" />
                  </div>
                </Button>
              )}
            </div>
            <div className="relative mb-6">
              <Search className="absolute rtl:right-3 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('search_node') || 'Search Node'}
                className="pl-9 rtl:pr-9 bg-white/2 border-glass-border hover:border-primary/30 transition-colors h-11"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-150 no-scrollbar pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" />
                </div>
              ) : treeData.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FolderTree className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground">{t('no_categories_found')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">{renderTree(treeData)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="col-span-12 xl:col-span-9">
          <div>
            <CategoryForm
              category={selectedCategory}
              availableCategories={flatCategories}
              onSuccess={() => {
                refetch()
              }}
              onCancel={() => setSelectedCategory(null)}
            />
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          title={t('delete_category')}
          description={t('delete_category_description')}
        />
      </div>
    )
  },
)

CategoryManagement.displayName = 'CategoryManagement'

export default CategoryManagement
