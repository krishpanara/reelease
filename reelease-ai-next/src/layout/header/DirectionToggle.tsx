'use client'

import { Button } from '@/components/ui/button'
import { toggleDirection } from '@/redux/slices/layoutSlice'
import { RootState } from '@/redux/store'
import { PilcrowLeft, PilcrowRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

const DirectionToggle = () => {
  const dispatch = useDispatch()
  const direction = useSelector((state: RootState) => state.layout.direction)

  const handleToggle = () => {

    dispatch(toggleDirection())
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={direction === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'}
      className="h-9 w-9 sm:h-11 sm:w-11 p-3 hover:bg-accent! rounded-full hover:border-glass-border"
    >
      {direction === 'ltr' ? (
        <PilcrowRight className="w-[18px]! h-[18px]! text-subtitle-color dark:text-white/70 group-hover:text-primary transition-colors duration-300" />
      ) : (
        <PilcrowLeft className="w-[18px]! h-[18px]! text-subtitle-color dark:text-white/70 group-hover:text-primary transition-colors duration-300" />
      )}
    </Button>
  )
}

export default DirectionToggle
