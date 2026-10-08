'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Attachment, BlogCardProps, Category, Tag } from '@/types'
import { Calendar, ChevronRight, Pencil, Star, Trash2, User } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export default function BlogCard({ blog, onEdit, onDelete, onClick }: BlogCardProps) {
  const { t } = useTranslation()
  const thumbnail = blog.thumbnail_id as Attachment

  return (
    <div
      className="group relative flex flex-col p-2  rounded-border-radius border border-border/40 glass-card bg-white dark:bg-white/3 overflow-hidden transition-all duration-500 hover:-translate-y-2 glass-dark-card h-full cursor-pointer"
      onClick={() => onClick(blog)}
    >
      {/* Image Section */}
      <div className="relative flex-none aspect-[16/10] rounded-border-radius overflow-hidden  transition-all duration-500">
        <div className="absolute inset-0 transition-all duration-300 ">
          <div className="relative w-full h-full rounded-border-radius overflow-hidden hover-gradient-border shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            {thumbnail ? (
              <Image
                fill
                src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${typeof thumbnail === 'string' ? thumbnail : thumbnail.file_path}`}
                alt={blog.title}
                unoptimized
                className="absolute inset-0 w-full h-full object-cover rounded-border-radius transition-transform duration-700 group-hover:scale-95"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{blog.title.charAt(0)}</span>
                </div>
              </div>
            )}
            <div className="absolute inset-0  border rounded-border-radius" />

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 rtl:left-[unset] rtl:right-4 flex flex-wrap gap-2 z-10">
              {(blog.categories as Category[]).slice(0, 2).map((cat) => (
                <Badge
                  key={cat._id || cat.id}
                  className="bg-black/55 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-all text-xs sm:text-xs font-medium px-3 py-1 rounded-full capitalize"
                >
                  {cat.name}
                </Badge>
              ))}
            </div>

            {blog.is_featured && (
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse z-10">
                <Star className="w-4 h-4 text-white fill-current" />
              </div>
            )}



            {/* Action Buttons (Visible on hover) */}
            {(onEdit || onDelete) && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-black/20">
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-black/55 border-white/55  text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(blog)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-10 w-10 rounded-full  bg-black/55 border-white/55  text-white hover:bg-black/40 hover:text-white backdrop-blur-3xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(blog._id || (blog as any).id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 gap-3 pb-2!">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <span className="w-0.5 h-4 bg-muted-foreground/25" />
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            Admin
          </div>
        </div>

        <h3 className="text-[18px] font-bold leading-[1.4] line-clamp-2 text-sidebar-title-color dark:text-white transition-colors ">
          {blog.title}
        </h3>
        <div className="mt-auto pt-2 flex items-end justify-between border-t border-border">
          <div className=" flex flex-wrap! flex-row gap-2 z-10">
            {(blog.tags as Tag[]).slice(0, 2).map((tag) => {
              const hasMultipleTags = (blog.tags || []).length > 1
              const truncatedTitle = hasMultipleTags && tag.title.length > 4 ? `${tag.title.slice(0, 4)}...` : tag.title
              return (
                <Badge
                  key={tag._id || (tag as any).id}
                  className="bg-primary/20 backdrop-blur-lg text-primary border-primary/10 text-xs sm:text-xs font-medium px-3 py-1 rounded-full cursor-pointer"
                  title={`#${tag.title}`}
                >
                  #{truncatedTitle}
                </Badge>
              )
            })}
          </div>
          <Button
            variant="ghost"
            className="text-primary  hover:text-primary hover:bg-primary/10 rounded-full px-4 h-9 gap-2 group/btn"
          >
            <span className="text-sm rtl:order-2! font-bold tracking-wider">{t('read_more')}</span>
            <ChevronRight className="w-4 h-4 rtl:order-1! transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
