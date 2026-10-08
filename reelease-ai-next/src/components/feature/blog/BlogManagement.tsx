'use client'

import { PageHeader } from '@/components/reusable/PageHeader'
import Input from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PERMISSIONS } from '@/constants/permissions'
import { useAppDirection } from '@/hooks/useAppDirection'
import { usePermission } from '@/hooks/usePermission'
import { FileImage, FileText, FolderTree, Hash, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BlogList from './BlogList'
import CategoryManagement from './CategoryManagement'
import TagManagement from './TagManagement'

import { Button } from '@/components/ui/button'

const BlogManagement = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasPermission } = usePermission()

  const canViewBlogs = hasPermission(PERMISSIONS.VIEW_BLOGS)
  const canViewCategories = hasPermission(PERMISSIONS.VIEW_CATEGORIES)
  const canViewTags = hasPermission(PERMISSIONS.VIEW_TAGS)
  const canManageBlogs = hasPermission(PERMISSIONS.MANAGE_BLOGS)

  const [activeTab, setActiveTab] = useState(canViewBlogs ? 'blogs' : canViewCategories ? 'categories' : 'tags')
  const [blogSearch, setBlogSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')

  const categoryRef = useRef<any>(null)
  const tagRef = useRef<any>(null)

  const direction = useAppDirection()

  // When user only has blog access (no categories/tags tabs needed),
  // skip the Tabs wrapper and put search + create in the page header.
  const onlyBlogsVisible = canViewBlogs && !canViewCategories && !canViewTags

  if (onlyBlogsVisible) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<FileImage className="w-6 h-6 text-primary animate-pulse" />}
          subtitle={t('blogs_desc', { defaultValue: 'Manage your Blogs' })}
          showBackButton={false}
          title={t('blog_management')}
          endContent={
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search_blogs_placeholder', { defaultValue: 'Search blogs...' })}
                  className="pl-12 rtl:pr-10 h-10 rounded-radius bg-white/3 border-border/40 focus:bg-white/3"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                />
              </div>
              {canManageBlogs && (
                <Button
                  onClick={() => router.push('/blogs/create')}
                  className="group p-button-padding! text-sm font-medium text-white! primary-btn leading-0 gap-1.5 transition-all duration-300 shrink-0"
                >
                  <span>{t('create_new_blog ')}</span>
                  <div className="w-4 opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden me-0">
                    <Plus className="w-5 h-5" />
                  </div>
                </Button>
              )}
            </div>
          }
        />
        <BlogList
          search={blogSearch}
          onEdit={(blog) => router.push(`/blogs/edit/${blog._id || (blog as any).id}`)}
        />
      </div>
    )
  }

  // Default: multi-tab layout with tabs for blogs / categories / tags
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileImage className="w-6 h-6 text-primary animate-pulse" />}
        subtitle={t('blogs_desc', { defaultValue: 'Manage your Blogs' })}
        showBackButton={false}
        title={t('blog_management')}
      />

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full" dir={direction}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-glass-bg border border-glass-border h-12! md:w-auto w-full w-full xl:w-auto inline-flex items-center rounded-full border border-glass-border p-1.5 gap-1">
            {canViewBlogs && (
              <TabsTrigger value="blogs" className="gap-2">
                <FileText className="w-4 h-4" />
                {t('blogs')}
              </TabsTrigger>
            )}
            {canViewCategories && (
              <TabsTrigger value="categories" className="gap-2">
                <FolderTree className="w-4 h-4" />
                {t('categories')}
              </TabsTrigger>
            )}
            {canViewTags && (
              <TabsTrigger value="tags" className="gap-2 ">
                <Hash className="w-4 h-4" />
                {t('tags')}
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {activeTab === 'blogs' && (
              <>
                <div className="relative md:w-80">
                  <Search className="absolute left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search_blogs_placeholder', { defaultValue: 'Search blogs...' })}
                    className="pl-12 rtl:pr-10 h-10 rounded-radius bg-white/3 border-border/40 focus:bg-white/3"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                  />
                </div>

                {canManageBlogs && (
                  <Button
                    onClick={() => {
                      router.push('/blogs/create')
                    }}
                    className=" group p-button-padding! text-sm font-medium text-white! primary-btn leading-0 gap-1.5 transition-all duration-300"
                  >
                    <span>{t('create_new_blog')}</span>
                    <div className="w-4 opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden me-0">
                      <Plus className="w-5 h-5" />
                    </div>
                  </Button>
                )}
              </>
            )}

            {activeTab === 'categories' && (
              <>
                <div className="relative md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t('search_categories', { defaultValue: 'Search categories...' })}
                    className="pl-12 h-10 rounded-radius bg-white/3 border-border/40 focus:bg-white/3"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
              </>
            )}

            {activeTab === 'tags' && (
              <>
                <div className="relative md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t('search_tags', { defaultValue: 'Search tags...' })}
                    className="pl-12 h-10 rounded-radius bg-white/3 border-border/40 focus:bg-white/3"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                  />
                </div>

                {canManageBlogs && (
                  <Button
                    onClick={() => tagRef.current?.handleCreate()}
                    className=" h-10 px-6 p-button-padding! text-sm font-medium text-white! primary-btn leading-0 gap-1.5 transition-all duration-300"
                  >
                    <span>{t('add_tag')}</span>
                    <div className="w-4 opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden me-0 ">
                      <Plus className="w-5 h-5" />
                    </div>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {canViewBlogs && (
          <TabsContent value="blogs" className="mt-0">
            <BlogList
              search={blogSearch}
              onEdit={(blog) => {
                router.push(`/blogs/edit/${blog._id || (blog as any).id}`)
              }}
            />
          </TabsContent>
        )}
        {canViewCategories && (
          <TabsContent value="categories" className="mt-0">
            <CategoryManagement ref={categoryRef} search={categorySearch} onSearchChange={setCategorySearch} canManageBlogs={canManageBlogs}/>
          </TabsContent>
        )}
        {canViewTags && (
          <TabsContent value="tags" className="mt-0">
            <TagManagement ref={tagRef} search={tagSearch} onSearchChange={setTagSearch} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default BlogManagement
