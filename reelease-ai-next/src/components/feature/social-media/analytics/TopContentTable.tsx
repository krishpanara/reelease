import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Award, Clock, ThumbsUp, MessageSquare, Share2, Facebook } from 'lucide-react'
import { getMediaUrl } from '@/utils'
import { format } from 'date-fns'
import { platformIcons, platformColors } from '@/data/analyticsData'
import { TopContentTableProps } from '@/types/analytics'

export default function TopContentTable({ filteredTopPosts, t }: TopContentTableProps) {
  return (
    <Card className="glass-card bg-white dark:bg-white/3 border-none p-0!">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-title-color dark:text-white">
              {t('top_performing_content', { defaultValue: 'Top Performing Content' })}
            </h3>
            <p className="text-sm text-subtitle-color">
              {t('publications_with_highest_engagement', {
                defaultValue: 'Your most popular posts ranked by total interactions',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full p-0! no-scrollbar">
        {filteredTopPosts.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="dark:bg-white/3 bg-black/3 rounded-border-radius-inner">
              <tr className="border-b border-glass-border text-left text-sm font-medium! text-subtitle-color">
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6">
                  {t('post_details', { defaultValue: 'Post details' })}
                </th>
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6">
                  {t('platform', { defaultValue: 'Platform' })}
                </th>
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6">
                  {t('published_date', { defaultValue: 'Published Date' })}
                </th>
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6 text-center">
                  <ThumbsUp className="w-4 h-4 mx-auto text-blue-400" />
                </th>
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6 text-center">
                  <MessageSquare className="w-4 h-4 mx-auto text-teal-400" />
                </th>
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6 text-center">
                  <Share2 className="w-4 h-4 mx-auto text-pink-400" />
                </th>
                <th className="h-14 text-sm font-semibold text-subtitle-color! px-6 text-center">
                  {t('engagement', { defaultValue: 'Engagement' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border text-sm">
              {filteredTopPosts.map((post) => {
                const Icon = platformIcons[post.platform.toLowerCase()] || Facebook
                const color = platformColors[post.platform.toLowerCase()] || '#8B5CF6'
                const meta = post.metadata || {}

                const likes = post.likeCount ?? Number(meta.likes || meta.like_count || 0)
                const comments = post.commentCount ?? Number(meta.comments || meta.comment_count || 0)
                const shares = post.shareCount ?? Number(meta.shares || meta.share_count || 0)
                const total = post.engagementCount || likes + comments + shares

                const dateVal = post.published_at || post.scheduled_at || post.created_at
                const formattedDate = dateVal ? format(new Date(dateVal), 'MMM dd, yyyy') : 'Recent'

                return (
                  <tr key={post._id || post.id} className="hover:bg-white/3 transition-colors duration-200">
                    <td className="py-4 pr-4 max-w-xs sm:max-w-md px-4">
                      <div className="flex items-center gap-3">
                        {post.media_urls?.[0] ? (
                          post.media_urls[0].toLowerCase().includes('.mp4') ? (
                            <video
                              src={getMediaUrl(post.media_urls[0])}
                              className="rounded-lg w-10 h-10 object-cover shrink-0 bg-black/20"
                              muted
                            />
                          ) : (
                            <Image
                              src={getMediaUrl(post.media_urls[0])}
                              alt=""
                              width={40}
                              height={40}
                              className="rounded-lg w-10 h-10 object-cover shrink-0 bg-black/20"
                              unoptimized
                            />
                          )
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                        )}
                        <p className="font-medium text-title-color dark:text-white line-clamp-2 leading-tight">
                          {post.caption || t('no_caption', { defaultValue: 'No caption' })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="capitalize text-xs font-semibold text-subtitle-color">
                          {post.platform}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-subtitle-color whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {formattedDate}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-title-color dark:text-white whitespace-nowrap">
                      {likes}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-title-color dark:text-white whitespace-nowrap">
                      {comments}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-title-color dark:text-white whitespace-nowrap">
                      {shares}
                    </td>
                    <td className="py-4 px-4 text-center font-extrabold text-primary whitespace-nowrap">
                      {total}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
            <Award className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">
              {t('no_top_posts_found', { defaultValue: 'No top-performing posts found in this period.' })}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
