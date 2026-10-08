'use client'

import { useSectionRefs } from '@/context/SectionRefsContext'
import { useGetAttachmentByIdQuery } from '@/redux/api/attachmentApi'
import { BlogPost, LandingPageData } from '@/types/landing'
import { formatDate, getMediaUrl } from '@/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronRight, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Button } from '../ui/button'
import { ROUTES } from '@/constants/routes'

function BlogImage({
  thumbnailId,
  fallback,
  alt,
  ...props
}: {
  thumbnailId?: any
  fallback: string
  alt: string
} & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  const isId = typeof thumbnailId === 'string' && thumbnailId.length === 24
  const { data: attachment } = useGetAttachmentByIdQuery(thumbnailId, {
    skip: !isId,
  })

  // Priority:
  // 1. Fetched attachment file_path
  // 2. Already populated thumbnailId.file_path
  // 3. Fallback (which might be a default URL or the ID-based URL)
  const src = attachment?.file_path
    ? getMediaUrl(attachment.file_path)
    : thumbnailId?.file_path
      ? getMediaUrl(thumbnailId.file_path)
      : fallback

  return <Image src={src} alt={alt} {...props} unoptimized />
}

export default function LandingBlog({ data }: { data?: LandingPageData['blog'] & { posts?: BlogPost[] } }) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionBadge = data?.badge || t('insights_updates')
  const sectionTitle = data?.title || t('latest_from')
  const sectionDescription = data?.description || 'Choose the plan that fits your creative needs. Scale as you grow.'

  const blogPosts: BlogPost[] = (data?.blog_ids || []).map((b: any, index: number) => ({
    id: b._id || index,
    title: b.title || 'Untitled Post',
    excerpt: b.description || 'No description available for this pulse of innovation.',
    image:
      getMediaUrl(
        b.thumbnail_id?.file_path ||
        b.thumbnail?.file_path ||
        (typeof b.thumbnail_id === 'string' && b.thumbnail_id.length !== 24 ? b.thumbnail_id : ''),
      ) || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    thumbnail_id: b.thumbnail_id,
    date: formatDate(b.created_at),
    author: 'Admin',
    readTime: '5 min read',
    category: b.categories?.[0]?.name || 'Insights',
  }))

  const activePost = blogPosts[activeIndex] || blogPosts[0]

  return (
    <section
      id="blog"
      ref={(el) => registerRef('blog', el)}
      className="relative py-24 md:py-30 bg-light-body overflow-hidden"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[70%] h-[400px] bg-primary/10 rounded-full blur-[150PX] pointer-events-none" />
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[40%] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-16 gap-8">
          <div className="text-center max-w-3xl mx-auto ">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {sectionBadge}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            >
              {sectionTitle}{' '}
              {sectionTitle === t('latest_from') && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                  {t('our_blog')}
                </span>
              )}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-white/60 max-w-2xl mx-auto"
            >
              {sectionDescription}
            </motion.p>
          </div>
        </div>

        {/* Content */}
        {blogPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Blogs Found</h3>
            <p className="text-white/40 text-center">
              There are currently no blogs available to display in this section.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Bento Grid with Interactivity */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full mb-6"
            >
              {/* Main Large Card (Dynamic) */}
              <motion.div
                layoutId="main-card"
                className="lg:col-span-8 group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 h-[500px] md:h-[600px] cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePost.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <BlogImage
                      thumbnailId={activePost.thumbnail_id}
                      fallback={activePost.image}
                      alt={activePost.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-deep via-dark-deep/60 to-transparent" />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                  <motion.div
                    key={`meta-${activePost.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full bg-primary/80 border border-primary/30 text-white text-xs font-medium backdrop-blur-md shadow-sm">
                        {t(activePost.category)}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-white/90 text-xs font-medium backdrop-blur-md shadow-sm">
                        {activePost.readTime}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 transition-colors text-wrap">
                      {t(activePost.title)}
                    </h3>
                    <p className="text-white/60 text-lg line-clamp-2 text-wrap mb-2">{t(activePost.excerpt)}</p>
                    <Link href={ROUTES.AUTH.LOGIN}>
                      <Button className="flex items-center gap-2 bg-white/10 hover:bg-primary! p-0! text-white! font-medium group/btn">
                        <span className="text-sm">Read Article</span>
                        <div className="rounded-full  flex items-center justify-center transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Side Stack (Selection) - Hidden on mobile/tablet (< 1024px) */}
              <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
                {blogPosts.slice(0, 3).map((post: BlogPost, index: number) => {
                  return (
                    index !== activeIndex && (
                      <motion.div
                        key={post.id}
                        layoutId={`card-${post.id}`}
                        onClick={() => setActiveIndex(blogPosts.indexOf(post))}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 h-[190px] md:h-[288px] lg:h-[calc(50%-12px)] cursor-pointer transition-all duration-300 hover:border-primary/30"
                      >
                        <BlogImage
                          thumbnailId={post.thumbnail_id}
                          fallback={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-deep via-dark-deep/60 to-transparent" />
                        <div className="absolute top-4 right-4 z-20">
                          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/20 text-primary text-[10px] font-bold tracking-widest">
                              {t(post.category)}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-white/90 text-[10px] font-medium ">
                              {post.readTime}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {t(post.title)}
                          </h3>
                        </div>
                      </motion.div>
                    )
                  )
                })}
                {/* Fallback to show another post if the index is active */}
                {activeIndex <= 2 && blogPosts.length > 3 && (
                  <motion.div
                    onClick={() => setActiveIndex(3)}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 h-[190px] md:h-[288px] lg:h-[calc(50%-12px)] cursor-pointer transition-all duration-300 hover:border-primary/30"
                  >
                    <BlogImage
                      thumbnailId={blogPosts[3].thumbnail_id}
                      fallback={blogPosts[3].image}
                      alt={blogPosts[3].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-deep via-dark-deep/60 to-transparent" />
                    <div className="absolute top-4 right-4 z-20">
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-1 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                          {t(blogPosts[3]?.category)}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-white/90 text-[10px] font-medium uppercase">
                          {blogPosts[3]?.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {t(blogPosts[3]?.title)}
                      </h3>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Bottom Dynamic Slider */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12"
            >
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                slidesPerView={1.2}
                breakpoints={{
                  640: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3.5 },
                  1280: { slidesPerView: 5 },
                }}
                autoplay={{ delay: 5000, disableOnInteraction: true }}
              >
                {blogPosts.map((post: BlogPost, index: number) => (
                  <SwiperSlide key={post.id}>
                    <motion.div
                      onClick={() => setActiveIndex(index)}
                      className={`relative flex items-center gap-4 p-4 rounded-border-radius border transition-all duration-500 group cursor-pointer h-full ${activeIndex === index
                        ? 'bg-primary/10 border-primary/40'
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'
                        }`}
                    >
                      {activeIndex === index && (
                        <motion.div
                          layoutId="active-glow"
                          className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl -z-10"
                        />
                      )}

                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                        <BlogImage thumbnailId={post.thumbnail_id} fallback={post.image} alt={post.title} fill />
                        {activeIndex === index && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-primary text-sm font-bold truncate">{t(post.category)}</span>
                          {/* {activeIndex === index && (
                            <span className="flex items-center gap-1 text-white/40 text-[11px] font-medium ">
                              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                              {t('now_reading')}
                            </span>
                          )} */}
                        </div>
                        <h4
                          className={`font-bold text-[13px] line-clamp-2 leading-snug transition-colors ${activeIndex === index ? 'text-white' : 'text-white group-hover:text-primary'
                            }`}
                        >
                          {t(post.title)}
                        </h4>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
