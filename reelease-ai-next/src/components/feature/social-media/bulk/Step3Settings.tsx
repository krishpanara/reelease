'use client'

import React from 'react'
import { Calendar as CalendarIcon, ChevronDown, Layers2, Settings, X, AlertTriangle, Info } from 'lucide-react'
import { format, parse } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface Step3SettingsProps {
  postingInterval: number
  setPostingInterval: (v: number) => void
  scheduledDate: Date | undefined
  setScheduledDate: (v: Date | undefined) => void
  scheduledTime: string
  setScheduledTime: (v: string) => void
  timezone: string
  setTimezone: (v: string) => void
  timezoneDropdownOpen: boolean
  setTimezoneDropdownOpen: (v: boolean) => void
  skipWeekends: boolean
  setSkipWeekends: (v: boolean) => void
  maxPostsPerDay: number | ''
  setMaxPostsPerDay: (v: number | '') => void
  autoHashtagRules: string[]
  hashtagRuleInput: string
  setHashtagRuleInput: (v: string) => void
  handleAddHashtagRule: () => void
  handleRemoveHashtagRule: (tag: string) => void
  stopOnError: boolean
  setStopOnError: (v: boolean) => void
  addFirstComment: boolean
  setAddFirstComment: (v: boolean) => void
}

export const Step3Settings = ({
  postingInterval,
  setPostingInterval,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  timezone,
  setTimezone,
  timezoneDropdownOpen,
  setTimezoneDropdownOpen,
  skipWeekends,
  setSkipWeekends,
  maxPostsPerDay,
  setMaxPostsPerDay,
  autoHashtagRules,
  hashtagRuleInput,
  setHashtagRuleInput,
  handleAddHashtagRule,
  handleRemoveHashtagRule,
  stopOnError,
  setStopOnError,
  addFirstComment,
  setAddFirstComment,
}: Step3SettingsProps) => {
  return (
    <div className="sm:p-6 p-4 rounded-border-radius border border-glass-border dark:bg-white/3 bg-white backdrop-blur-md space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full primary-btn text-white flex items-center justify-center text-sm font-black shrink-0">
          3
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold text-title-color dark:text-white tracking-wide">Settings & Rules</h3>
          <p className="text-sm text-subtitle-color mt-0.5">Configure how your posts should be published.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posting Interval */}
        <div className="space-y-2 relative">
          <Label className="text-sm font-black text-subtitle-color mb-2 block">Posting Interval</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={postingInterval}
              onChange={(e) => setPostingInterval(parseInt(e.target.value) || 10)}
              className="w-[90px]!  h-8! rounded-lg bg-black/3 dark:bg-white/3 border-glass-border text-center text-xs text-title-color dark:text-white font-bold"
            />
            <span className="text-xs font-medium text-subtitle-color">Minutes</span>
          </div>
        </div>

        {/* When to Start Scheduled Popover */}
        <div className="space-y-2 relative flex flex-col">
          <label className="text-sm font-black text-subtitle-color mb-2 block">When to Start</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full h-10 justify-start text-left font-normal rounded-border-radius dark:bg-white/3! hover:bg-[unset] hover:text-title-color dark:hover:text-white bg-black/3 dark:bg-black/40 border-glass-border hover:border-primary/30 transition-all px-3',
                  !scheduledDate && 'text-subtitle-color/60'
                )}
              >
                <CalendarIcon className="mr-2.5 h-4 w-4 text-primary shrink-0" />
                {scheduledDate ? (
                  <div className="flex items-center gap-1.5 overflow-hidden truncate">
                    <span className="font-semibold text-xs text-title-color dark:text-white">
                      {format(scheduledDate, 'PPP')}
                    </span>
                    {scheduledTime && (
                      <span className="text-[10px] text-subtitle-color">
                        {format(parse(scheduledTime, 'HH:mm', new Date()), 'hh:mm a')}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-bold">Select Date & Time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-glass-border bg-white dark:bg-[#0f0f1a]/95 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl z-[60]"
              align="start"
            >
              <div className="p-4 space-y-4">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-xl shadow-none! border-none! outline-none! focus:border-none! focus:outline-none! p-0!"
                />
                <div className="border-t border-glass-border pt-3 space-y-1.5">
                  <p className="text-xs font-medium text-subtitle-color px-1 font-bold!">
                    Operational Time
                  </p>
                  <Input
                    type="time"
                    className="h-9 rounded-border-radius!  text-xs font-bold border-glass-border w-full text-title-color dark:text-white"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Timezone Dropdown */}
        <div className="space-y-2 relative">
          <label className="text-sm font-black text-subtitle-color mb-2 block">
            Timezone
          </label>
          <Popover open={timezoneDropdownOpen} onOpenChange={setTimezoneDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 justify-between font-normal rounded-border-radius bg-black/3 dark:bg-white/3! border-glass-border text-title-color dark:text-white text-xs px-3"
              >
                <span className="truncate mr-1 font-semibold">{timezone}</span>
                <ChevronDown className="w-3.5 h-3.5 text-subtitle-color shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-1 bg-white dark:bg-white/3  border-glass-border backdrop-blur-3xl rounded-xl z-[60]"
              align="start"
            >
              {[
                '(GMT+5:30) Asia/Kolkata',
                '(GMT-5:00) America/New_York',
                '(GMT+0:00) Europe/London',
                '(GMT+8:00) Asia/Singapore',
              ].map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setTimezone(opt)
                    setTimezoneDropdownOpen(false)
                  }}
                  className={cn(
                    'w-full justify-start text-left text-xs font-semibold px-3 py-2 rounded-lg mb-0.5 last:mb-0 h-auto',
                    timezone === opt
                      ? 'bg-primary/10 text-primary'
                      : 'text-title-color/80 dark:text-white/70 hover:text-title-color dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {opt}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Toggles Container */}
      <div className="space-y-4 pt-4 border-t border-glass-border">
        {/* Skip on Holidays */}
        <div className="flex items-center justify-between p-4 rounded-border-radius dark:bg-white/3! bg-black/3 border border-glass-border">
          <div className="flex gap-3">
            <CalendarIcon className="w-5 h-5 text-subtitle-color shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-title-color dark:text-white">Skip on weekends</h4>
              <p className="text-[10px] text-subtitle-color mt-0.5">Skip posting on Saturday and Sunday</p>
            </div>
          </div>
          <Switch checked={skipWeekends} onCheckedChange={setSkipWeekends} />
        </div>

        {/* Maximum Posts Per Day */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md dark:bg-white/3! bg-black/3 border border-glass-border">
          <div className="flex gap-3">
            <Layers2 className="w-5 h-5 text-subtitle-color shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-title-color dark:text-white">Maximum Posts Per Day</h4>
              <p className="text-xs text-subtitle-color mt-0.5">Limit posts per day</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <Input
              type="number"
              value={maxPostsPerDay}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') {
                  setMaxPostsPerDay('')
                } else {
                  const parsed = parseInt(val, 10)
                  if (!isNaN(parsed)) {
                    setMaxPostsPerDay(parsed < 1 ? 1 : parsed)
                  }
                }
              }}
              className="w-20 h-8 rounded-lg bg-black/3 dark:bg-white/3 border border-glass-border text-center text-xs text-title-color dark:text-white font-bold"
            />
            <span className="text-xs font-semibold text-subtitle-color">posts</span>
          </div>
        </div>

        {/* Auto Hashtag Rules */}
        <div className="p-4 rounded-md dark:bg-white/3! bg-black/3 border border-glass-border space-y-3">
          <div className="flex gap-3">
            <Settings className="w-5 h-5 text-subtitle-color shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-title-color dark:text-white">Auto Hashtag Rules</h4>
              <p className="text-xs text-subtitle-color mt-0.5">Automatically add hashtags based on rules</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={hashtagRuleInput}
              onChange={(e) => setHashtagRuleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleAddHashtagRule()
                }
              }}
              placeholder="Type a hashtag rule and press Enter..."
              className="h-9 rounded-lg border-glass-border text-xs text-title-color"
            />
            <Button
              onClick={handleAddHashtagRule}
              className="h-9 px-4 rounded-lg primary-btn text-white! text-xs font-bold transition-all"
            >
              Add
            </Button>
          </div>
          {autoHashtagRules.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {autoHashtagRules.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-border-radius bg-primary/5 border border-primary/10 text-xs font-bold text-primary transition-all break-all whitespace-normal hover:bg-primary/10 cursor-default animate-fade-in"
                >
                  #{tag}
                  <Button
                    onClick={() => handleRemoveHashtagRule(tag)}
                    className="text-subtitle-color! cursor-pointer transition-colors bg-[unset]! p-0! "
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stop on Error */}
        <div className="flex items-center justify-between p-4 rounded-border-radius dark:bg-white/3! bg-black/3 border border-glass-border">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-subtitle-color shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-title-color dark:text-white">Stop on error</h4>
              <p className="text-xs text-subtitle-color mt-0.5">Stop importing if any error occurs</p>
            </div>
          </div>
          <Switch checked={stopOnError} onCheckedChange={setStopOnError} />
        </div>

        {/* Add first comment */}
        <div className="flex items-center justify-between p-4 rounded-border-radius dark:bg-white/3! bg-black/3 border border-glass-border">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-subtitle-color shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-title-color dark:text-white">Add first comment</h4>
              <p className="text-xs text-subtitle-color mt-0.5">Import and add first comment from CSV</p>
            </div>
          </div>
          <Switch checked={addFirstComment} onCheckedChange={setAddFirstComment} />
        </div>
      </div>
    </div>
  )
}
