import { TestProviderResultViewProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'



export const TestProviderResultView = ({ result, isVideo }: TestProviderResultViewProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {result?.status === 'completed' && result.url ? (
        <div className="group relative">
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 0.8, ease: 'circOut' }}
            className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-black border-4 border-emerald-500/20 shadow-2xl"
          >
            {isVideo ? (
              <video
                src={getMediaUrl(result.url)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <Image src={getMediaUrl(result.url)} alt="Result" fill className="object-contain" unoptimized />
            )}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-4 -right-4 bg-emerald-500 text-black p-4 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle2 className="w-6 h-6 font-bold" />
          </motion.div>
        </div>
      ) : (
        <div className="w-full py-16 rounded-[40px] bg-destructive/5 border-4 border-destructive/10 flex flex-col items-center justify-center gap-6">
          <div className="p-6 rounded-[24px] bg-destructive/10 border border-destructive/20 rotate-45">
            <AlertCircle className="w-10 h-10 text-destructive -rotate-45" />
          </div>
          <div className="text-center space-y-2 px-8">
            <h4 className="text-2xl font-black text-foreground tracking-tight">
              {t('magic_failed', 'Magic Interrupted')}
            </h4>
            <p className="text-muted-foreground font-medium text-sm max-w-sm">
              {result?.message || t('unknown_error', 'The AI encountered an unexpected boundary.')}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
