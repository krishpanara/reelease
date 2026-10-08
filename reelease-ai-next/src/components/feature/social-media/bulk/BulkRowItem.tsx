'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format, parse } from 'date-fns'
import { contentType } from '@/data/bulk'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdownMenu'
import Input from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textArea'
import { cn } from '@/lib/utils'
import { BulkRowItemProps } from '@/types/socialMedia'
import { AlertTriangle, Calendar as CalendarIcon, Link as LinkIcon, Trash2, X } from 'lucide-react'
import { AccountMultiSelect } from './AccountMultiSelect'

export const BulkRowItem = ({
  row,
  index,
  accounts,
  onChange,
  onRemove,
}: BulkRowItemProps) => {
  const hasErrors = Object.keys(row.errors).length > 0

  const scheduledDateObj = row.scheduledAt ? new Date(row.scheduledAt) : undefined;
  const scheduledTimeStr = row.scheduledAt ? format(scheduledDateObj!, 'HH:mm') : '12:00';

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) {
      onChange(row.id, 'scheduledAt', '')
      return
    }
    const timeParts = scheduledTimeStr.split(':')
    const newDate = new Date(d)
    newDate.setHours(parseInt(timeParts[0] || '12', 10))
    newDate.setMinutes(parseInt(timeParts[1] || '0', 10))

    const pad = (n: number) => n.toString().padStart(2, '0')
    const val = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}T${pad(newDate.getHours())}:${pad(newDate.getMinutes())}`
    onChange(row.id, 'scheduledAt', val)
  }

  const handleTimeChange = (timeStr: string) => {
    if (!scheduledDateObj) return;
    const timeParts = timeStr.split(':')
    const newDate = new Date(scheduledDateObj)
    newDate.setHours(parseInt(timeParts[0] || '12', 10))
    newDate.setMinutes(parseInt(timeParts[1] || '0', 10))

    const pad = (n: number) => n.toString().padStart(2, '0')
    const val = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}T${pad(newDate.getHours())}:${pad(newDate.getMinutes())}`
    onChange(row.id, 'scheduledAt', val)
  }

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 max-h-max ${hasErrors
        ? 'border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/5'
        : 'border-glass-border bg-white/3 dark:bg-white/3 hover:bg-white/6 hover:border-primary/30 '
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold primary-btn text-white w-6 h-6 flex items-center justify-center rounded-full">
            {index + 1}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-7 px-3 flex items-center justify-between gap-2 rounded-lg bg-black/3 dark:bg-white/5 border border-glass-border text-[10px] uppercase tracking-wider font-bold text-title-color/80 dark:text-white/70 hover:text-title-color dark:hover:text-white hover:border-primary/30 transition-all duration-300 capitalize"
              >
                {row.contentType}
                <span className="text-subtitle-color text-[10px]">↓</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32 bg-white dark:bg-[#0f0f1a]/95 border-glass-border backdrop-blur-xl rounded-xl z-[60]">
              {contentType.map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => onChange(row.id, 'contentType', t)}
                  className="capitalize text-xs font-bold text-title-color/80 dark:text-white/70 hover:text-title-color dark:hover:text-white cursor-pointer py-2"
                >
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          type="button"
          onClick={() => onRemove(row.id)}
          className="h-7! w-7! p-0! flex items-center  justify-center rounded-full bg-destructive! text-white! hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
        </Button>
      </div>

      {/* Caption */}
      <div className="flex-1 mb-2 space-y-1">
        <div className="relative h-full min-h-[90px]">
          <Textarea
            value={row.caption}
            onChange={(e) => onChange(row.id, 'caption', e.target.value)}
            placeholder="Write your caption here..."
            className={`w-full h-full p-3 rounded-border-radius bg-black/3 dark:bg-white/3 border text-xs text-title-color dark:text-white placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 ${row.errors.caption ? 'border-red-500/50' : 'border-glass-border hover:border-primary/30'
              }`}
          />
          {row.errors.caption && (
            <p className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-left-1">
              <AlertTriangle className="w-3 h-3" />
              {row.errors.caption}
            </p>
          )}
        </div>
      </div>

      {/* Carousel Multiple Media View */}
      {((row as any).mediaFiles && (row as any).mediaFiles.length > 0) && (
        <div className="flex gap-2 p-2 rounded-xl bg-black/3 dark:bg-white/3 border border-glass-border overflow-x-auto custom-scrollbar mb-2 max-h-16 shrink-0">
          {(row as any).mediaFiles.map((m: any, idx: number) => {
            const src = m.file_path || m
            const displaySrc = src.startsWith('http') ? src : `/api/${src.replace(/^\//, '')}`
            return (
              <div key={idx} className="relative w-10 h-10 rounded-full! border border-glass-border overflow-hidden  shrink-0 group">
                {m.mime_type?.startsWith('video/') ? (
                  <video src={displaySrc} className="w-full h-full object-cover ounded-full " muted />
                ) : (
                  <img src={displaySrc} className="w-full h-full object-cover ounded-full" alt="" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    const updated = (row as any).mediaFiles.filter((_: any, i: number) => i !== idx)
                    onChange(row.id, 'mediaFiles', updated)
                  }}
                  className="absolute top-0 right-0 p-0.5 bg-red-500 hover:bg-red-600 rounded-full text-title-color dark:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-white!" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Inputs Section (Media & Date) */}
      <div className="space-y-2 mb-3 shrink-0">
        {/* Media URL */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtitle-color/60">
            <LinkIcon className="w-3.5 h-3.5" />
          </div>
          <Input
            type="url"
            value={row.mediaUrl}
            onChange={(e) => onChange(row.id, 'mediaUrl', e.target.value)}
            placeholder="Media URL (https://...)"
            className="h-9 pl-9 pr-3 rounded-border-radius bg-black/3 dark:bg-white/3 border border-glass-border text-xs! text-title-color dark:text-white placeholder-subtitle-color/50 focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/30 transition-all duration-300"
          />
        </div>

        {/* Schedule Date */}
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full h-9 justify-start text-left font-normal rounded-xl hover:bg-[unset] hover:text-title-color dark:hover:text-white bg-black/3 dark:bg-white/3 border-glass-border hover:border-primary/30 transition-all px-3',
                  !scheduledDateObj && 'text-subtitle-color/60',
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-subtitle-color/60 shrink-0" />
                {scheduledDateObj ? (
                  <div className="flex items-center gap-2 overflow-hidden truncate">
                    <span className="font-semibold text-xs text-title-color dark:text-white">{format(scheduledDateObj, 'PPP')}</span>
                    <span className="text-[10px] text-subtitle-color">
                      {format(parse(scheduledTimeStr, 'HH:mm', new Date()), 'hh:mm a')}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs">Schedule Date & Time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-glass-border bg-white dark:bg-[#0f0f1a]/95 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl z-[60]"
              align="start"
            >
              <div className="p-3 space-y-3">
                <Calendar
                  mode="single"
                  selected={scheduledDateObj}
                  onSelect={handleDateSelect}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-xl border border-glass-border bg-black/3 dark:bg-black/40"
                />
                <div className="border-t border-glass-border pt-3 space-y-1.5">
                  <p className="text-[10px] font-medium text-subtitle-color uppercase tracking-widest px-1">Time</p>
                  <Input
                    type="time"
                    className="h-9 rounded-xl bg-black/5 dark:bg-black/60 text-xs font-bold border-glass-border w-full text-title-color dark:text-white"
                    value={scheduledTimeStr}
                    onChange={(e) => handleTimeChange(e.target.value)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Footer (Accounts) */}
      <div className="border-t border-glass-border pt-3 shrink-0">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-subtitle-color/80 mb-1">Target Accounts</p>
          <AccountMultiSelect
            accounts={accounts}
            selected={row.accountIds}
            onChange={(ids) => onChange(row.id, 'accountIds', ids)}
          />
          {row.errors.accountIds && (
            <p className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-left-1">
              <AlertTriangle className="w-3 h-3" />
              {row.errors.accountIds}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
