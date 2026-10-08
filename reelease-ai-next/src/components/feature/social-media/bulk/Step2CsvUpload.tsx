'use client'

import React from 'react'
import { FileText, Upload, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Step2CsvUploadProps {
  csvFileName: string
  csvFileSize: string
  isDragOverCsv: boolean
  csvRef: React.RefObject<HTMLInputElement | null>
  handleCsvImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCsvDragOver: (e: React.DragEvent) => void
  handleCsvDragLeave: () => void
  handleCsvDrop: (e: React.DragEvent) => void
}

export const Step2CsvUpload = ({
  csvFileName,
  csvFileSize,
  isDragOverCsv,
  csvRef,
  handleCsvImport,
  handleCsvDragOver,
  handleCsvDragLeave,
  handleCsvDrop,
}: Step2CsvUploadProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* CSV drag drop container */}
      <div className="sm:p-6 p-4 rounded-border-radius border border-glass-border dark:bg-white/3 bg-white backdrop-blur-md space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full primary-btn text-white flex items-center justify-center text-sm font-black shrink-0">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-title-color  tracking-wide">Upload CSV & Media</h3>
            <p className="text-xs text-subtitle-color mt-0.5">Upload your CSV file and media (optional).</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* CSV Field Dropzone */}
          <div>
            <label className="text-sm font-black text-subtitle-color  mb-2 block">CSV File</label>
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="hidden"
            />
            {csvFileName ? (
              <div className="flex items-center flex-wrap gap-3 justify-between p-4 rounded-border-radius border border-glass-border bg-black/3 dark:bg-white/3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-title-color">{csvFileName}</h4>
                    <p className="text-sm text-subtitle-color mt-0.5">{csvFileSize}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    ✓
                  </span>
                  <Button
                    type="button"
                    onClick={() => csvRef.current?.click()}
                    className="h-10 px-3 text-xs font-black rounded-radius border border-glass-border dark:bg-white/3!  bg-black/3  text-title-color!"
                  >
                    Replace File
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleCsvDragOver}
                onDragLeave={handleCsvDragLeave}
                onDrop={handleCsvDrop}
                className={cn(
                  'sm:p-6 p-4 rounded-border-radius border-2 border-dashed text-center relative group min-h-[160px] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center',
                  isDragOverCsv
                    ? 'border-primary bg-primary/5'
                    : 'border-glass-border bg-black/3 dark:bg-white/3 hover:border-primary/30'
                )}
                onClick={() => csvRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-xl bg-black/3 dark:bg-white/5 border border-glass-border flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-primary/10 transition-all duration-300">
                  <Upload className="w-5 h-5 text-subtitle-color group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-base font-bold text-title-color dark:text-white mb-0.5">
                  Drag & drop CSV manifest here
                </h4>
                <p className="text-sm text-subtitle-color max-w-sm mb-4">
                  Upload your structured CSV template containing captions and media references.
                </p>
                <Button
                  type="button"
                  className="h-8 px-4 text-xs font-extrabold rounded-lg primary-btn  text-white! hover:scale-105 transition-all"
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSV Column Guide in Step 2 */}
      <div className="sm:p-6 p-4 rounded-border-radius border border-glass-border dark:bg-white/3 bg-white backdrop-blur-md space-y-4">
        <h4 className="text-sm font-black text-subtitle-color pb-3 border-b border-glass-border flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          CSV Column Guide
        </h4>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glass-border text-sm font-extrabold text-subtitle-color ">
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Requirement</th>
                <th className="py-2.5 px-3">Format / Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/30">
              {[
                { label: 'Date / Time', req: 'Required', desc: 'Format: YYYY-MM-DD HH:mm (e.g., 2026-06-15 14:30)' },
                { label: 'Caption', req: 'Required', desc: 'The text content of your post (supports emojis and hashtags)' },
                { label: 'Media URL', req: 'Required', desc: 'Public URL of your media file, or specific filename from library' },
                { label: 'Platforms', req: 'Required', desc: 'Comma-separated platform keys: instagram, facebook, linkedin, twitter, youtube' },
                { label: 'First Comment', req: 'Optional', desc: 'Text to automatically publish as the first comment' },
                { label: 'Location', req: 'Optional', desc: 'Add location search metadata to your post' },
                { label: 'Labels', req: 'Optional', desc: 'Comma-separated tags to organize posts in your dashboard' },
              ].map((col) => (
                <tr key={col.label} className="text-xs hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
                  <td className="py-3 px-3 font-bold text-title-color dark:text-white whitespace-nowrap">
                    {col.label}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-4xs font-bold tracking-wide',
                        col.req === 'Required'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      )}
                    >
                      {col.req}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-subtitle-color leading-normal min-w-[500px]">{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-subtitle-color mt-2">
          * Note: Make sure the spelling matches the guide columns exactly for the parser to align the fields.
        </p>
      </div>
    </div>
  )
}
