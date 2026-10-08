'use client'

import { Badge } from '@/components/ui/badge'
import { Attachment, BlogHeaderProps, Category } from '@/types'
import { getMediaUrl } from '@/utils'
import { User } from 'lucide-react'
import Image from 'next/image'

export default function BlogHeader({ blog }: BlogHeaderProps) {
  const thumbnail = blog.thumbnail_id as Attachment

  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden">
      {thumbnail?.file_path ? (
        <Image
          width={100}
          height={100}
          unoptimized
          src={getMediaUrl(thumbnail.file_path)}
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 right-4 sm:right-10">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
          {(blog.categories as Category[]).map((cat) => (
            <Badge
              key={cat._id || cat.id}
              className="bg-white/30 border-white/50! backdrop-blur-md border! px-3 sm:px-4 py-1 sm:py-1.5 text-white/70 rounded-full text-[10px] sm:text-xs font-bold tracking-wider"
            >
              {cat.name}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight break-all whitespace-normal line-clamp-3">
          {blog.title}
        </h1>
      </div>
    </div>
  )
}
