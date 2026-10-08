'use client'

import React from 'react'
import Image from 'next/image'
import { Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { XIcon } from '@/components/ui/XIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'
import { FacebookIcon as Facebook } from '@/components/ui/FacebookIcon'
import { InstagramIcon as Instagram } from '@/components/ui/InstagramIcon'
import { LinkedInIcon as Linkedin } from '@/components/ui/LinkedInIcon'
import { YouTubeIcon as Youtube } from '@/components/ui/YouTubeIcon'
import SafeImage from '@/components/ui/SafeImage'

interface Step1AccountsProps {
  groupedAccounts: Record<string, any[]>
  selectedAccountIds: string[]
  allAccountsSelected: boolean
  handleSelectAllAccounts: () => void
  handleToggleAccount: (id: string) => void
}

export const getPlatformIcon = (platform: string, className = 'w-4 h-4') => {
  const p = platform.toLowerCase()
  if (p === 'instagram') return <Instagram className={className} filled={true} />
  if (p === 'facebook') return <Facebook className={className} filled={true} />
  if (p === 'linkedin') return <Linkedin className={className} filled={true} />
  if (p === 'twitter' || p === 'x') return <XIcon className={className} filled={true} />
  if (p === 'youtube') return <Youtube className={className} filled={true} />
  if (p === 'threads') return <ThreadsIcon className={className} filled={true} />
  return <Info className={className} />
}

export const Step1Accounts = ({
  groupedAccounts,
  selectedAccountIds,
  allAccountsSelected,
  handleSelectAllAccounts,
  handleToggleAccount,
}: Step1AccountsProps) => {
  return (
    <div className="sm:p-6 p-4 rounded-border-radius border border-glass-border dark:bg-white/3 bg-white backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-y-3">
        <div className="flex items-center gap-3 ">
          <div className="w-9 h-9  rounded-full shrink-0 primary-btn text-white flex items-center justify-center text-sm font-black">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-title-color dark:text-white tracking-wide">Select Accounts</h3>
            <p className="text-sm text-subtitle-color mt-0.5">
              Select the social accounts where you want to publish posts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedAccountIds.length > 0 && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 animate-in fade-in duration-300">
              {selectedAccountIds.length} {selectedAccountIds.length === 1 ? 'account' : 'accounts'} selected
            </span>
          )}
          <Button
            type="button"
            onClick={handleSelectAllAccounts}
            className="h-8 px-4 text-xs font-bold rounded-lg border border-glass-border dark:bg-white/3! hover:border-primary/30 bg-black/3 dark:bg-white/5 text-title-color dark:text-white/80 hover:text-title-color dark:hover:text-white transition-all"
          >
            {allAccountsSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Connected channels grouped listing */}
      <div className="space-y-6">
        {Object.keys(groupedAccounts).map((platform) => (
          <div key={platform} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-glass-border pb-3">
              {getPlatformIcon(platform, 'w-4 h-4')}
              <span className="text-sm font-black text-title-color/80 dark:text-white/70 capitalize">{platform}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupedAccounts[platform].map((acc: any) => {
                const isSelected = selectedAccountIds.includes(acc.id || acc._id)
                return (
                  <div
                    key={acc.id || acc._id}
                    onClick={() => handleToggleAccount(acc.id || acc._id)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-[16px]  border cursor-pointer transition-all duration-300 ',
                      isSelected
                        ? 'border-primary bg-primary/5!'
                        : 'border-glass-border',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full border border-glass-border bg-black/3 dark:bg-white/5 flex items-center justify-center font-bold text-xs uppercase text-subtitle-color overflow-hidden">
                        {acc.profile_picture ? (
                          <SafeImage
                            src={acc.profile_picture}
                            fallbackName={acc.account_name}
                            alt={acc.account_name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        ) : (
                          getPlatformIcon(acc.platform, 'w-5 h-5')
                        )}
                      </div>
                      <div className="leading-tight min-w-0">
                        <h4 className="text-sm font-extrabold text-title-color dark:text-white truncate">
                          {acc.account_name}
                        </h4>
                        <p className="text-[12px] text-subtitle-color font-medium mt-0.5 truncate">
                          {acc.account_type || 'Business'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200',
                        isSelected ? 'bg-primary border-primary text-white' : 'border-glass-border',
                      )}
                    >
                      {isSelected && <Check className="w-2 h-2 stroke-[3.5]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
