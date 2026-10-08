'use client'

import React, { useState } from 'react'
import { ChevronDown, CheckCircle2, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AccountMultiSelectProps } from '@/types/socialMedia'
import { XIcon } from '@/components/ui/XIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'

export const AccountMultiSelect = ({ accounts, selected, onChange }: AccountMultiSelectProps) => {
  const [open, setOpen] = useState(false)

  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  const selectedAccounts = accounts.filter((a) => selected.includes(a.id || a._id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex items-center gap-2 w-full min-h-[40px] h-auto px-3 py-2 rounded-border-radius dark:bg-white/3 bg-black/3 border border-glass-border text-sm dark:text-white text-black hover:border-white/20 transition-all duration-300 text-left"
        >
          {selectedAccounts.length === 0 ? (
            <span className="text-white/30 text-xs font-normal">Select accounts</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 flex-1 items-center">
              {selectedAccounts.map((a) => (
                <div
                  key={a.id || a._id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-white/3  border border-glass-border"
                >
                  <Avatar className="w-5 h-5">
                    {a.profile_picture && <AvatarImage src={a.profile_picture} />}
                    <AvatarFallback
                      className={cn(
                        'w-full h-full flex items-center justify-center',
                        a.platform?.toLowerCase() === 'facebook'
                          ? 'bg-facebook! text-white'
                          : a.platform?.toLowerCase() === 'instagram'
                            ? 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white'
                            : a.platform?.toLowerCase() === 'linkedin'
                              ? 'bg-linkedin! text-white'
                              : a.platform?.toLowerCase() === 'twitter' || a.platform?.toLowerCase() === 'x'
                                ? 'bg-black! text-white'
                                : a.platform?.toLowerCase() === 'youtube'
                                  ? 'bg-red-500 text-white'
                                  : a.platform?.toLowerCase() === 'threads'
                                    ? 'bg-black! text-white'
                                    : 'bg-primary/20 text-white font-bold text-[8px]',
                      )}
                    >
                      {a.platform?.toLowerCase() === 'facebook' ? (
                        <Facebook className="w-2.5 h-2.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'instagram' ? (
                        <Instagram className="w-2.5 h-2.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'linkedin' ? (
                        <Linkedin className="w-2.5 h-2.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'twitter' || a.platform?.toLowerCase() === 'x' ? (
                        <XIcon className="w-2.5 h-2.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'youtube' ? (
                        <Youtube className="w-2.5 h-2.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'threads' ? (
                        <ThreadsIcon className="w-2.5 h-2.5 text-white" />
                      ) : (
                        a.account_name.substring(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-3xs font-bold text-title-color dark:text-white leading-none">
                    {a.account_name}
                  </span>
                </div>
              ))}
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-white/40 shrink-0 ml-auto transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-75 p-2 bg-black/3 dark:bg-white/3 backdrop-blur-xl border border-glass-border rounded-border-radius shadow-2xl z-[90]"
        align="start"
      >
        <div className="max-h-60 overflow-y-auto no-scrollbar">
          {accounts.length === 0 ? (
            <p className="text-xs text-white/40 p-4 text-center">No accounts connected</p>
          ) : (
            accounts.map((a) => {
              const isSelected = selected.includes(a.id || a._id)
              return (
                <Button
                  key={a.id || a._id}
                  type="button"
                  variant="ghost"
                  onClick={() => toggle(a.id || a._id)}
                  className={cn(
                    'w-full flex items-center justify-start gap-3 px-3 py-2.5 h-auto text-xs rounded-border-radius transition-all duration-200 mb-1 last:mb-0',
                    isSelected ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-white/80 hover:bg-white/5',
                  )}
                >
                  <Avatar className="w-6 h-6 border border-white/10 shrink-0">
                    {a.profile_picture && <AvatarImage src={a.profile_picture} />}
                    <AvatarFallback
                      className={cn(
                        'w-full h-full flex items-center justify-center',
                        a.platform?.toLowerCase() === 'facebook'
                          ? 'bg-[#1877F2] text-white'
                          : a.platform?.toLowerCase() === 'instagram'
                            ? 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white'
                            : a.platform?.toLowerCase() === 'linkedin'
                              ? 'bg-[#0A66C2] text-white'
                              : a.platform?.toLowerCase() === 'youtube'
                                ? 'bg-red-500 text-white'
                                : a.platform?.toLowerCase() === 'twitter' || a.platform?.toLowerCase() === 'x'
                                  ? 'bg-black text-white'
                                  : a.platform?.toLowerCase() === 'threads'
                                    ? 'bg-black text-white'
                                    : 'bg-primary/20 text-primary font-bold text-[8px]',
                      )}
                    >
                      {a.platform?.toLowerCase() === 'facebook' ? (
                        <Facebook className="w-3.5 h-3.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'instagram' ? (
                        <Instagram className="w-3.5 h-3.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'linkedin' ? (
                        <Linkedin className="w-3.5 h-3.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'youtube' ? (
                        <Youtube className="w-3.5 h-3.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'threads' ? (
                        <ThreadsIcon className="w-3.5 h-3.5 text-white" />
                      ) : a.platform?.toLowerCase() === 'twitter' || a.platform?.toLowerCase() === 'x' ? (
                        <XIcon className="w-3.5 h-3.5 text-white" />
                      ) : (
                        a.account_name.substring(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0 leading-tight">
                    <span className="font-semibold text-title-color dark:text-white truncate w-full text-left">
                      {a.account_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {a.platform}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 animate-in zoom-in" />}
                </Button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
