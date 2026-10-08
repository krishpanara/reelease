import { TestProviderProcessingViewProps } from '@/types'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'



export const TestProviderProcessingView = ({ taskId }: TestProviderProcessingViewProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8"
    >
      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-[#0A0A0A] border-4 border-glass-border shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-500/5 animate-pulse" />
        <div
          className="absolute inset-0 opacity-40 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ animationDuration: '1.5s' }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/40 blur-3xl animate-pulse" />
            <div className="relative p-6 rounded-[32px] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-4 text-center px-6">
            <h3 className="text-xl font-black text-white tracking-widest uppercase animate-pulse">
              {t('generating_vision', 'Generating Vision')}
            </h3>
            <div className="flex items-center gap-4 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 30, ease: 'linear' }}
              />
            </div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
              {t('processing_id', 'Processing ID')}: {taskId?.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] font-bold text-primary uppercase">
            {t('polling_status', 'Status: Polling Data')}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-[10px] font-bold text-purple-400 uppercase">
            {t('ai_engine_active', 'AI Engine Active')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
