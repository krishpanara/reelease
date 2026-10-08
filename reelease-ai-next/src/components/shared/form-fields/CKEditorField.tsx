'use client'

import Label from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CKEditorFieldProps, EditorModules } from '@/types'
import type { DecoupledEditor as DecoupledEditorType } from '@ckeditor/ckeditor5-editor-decoupled'
import 'ckeditor5/ckeditor5.css'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CKEditorField({ label, value, onChange, placeholder, className, error }: CKEditorFieldProps) {
  const { t } = useTranslation()
  const [editor, setEditor] = useState<EditorModules | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([import('@ckeditor/ckeditor5-react'), import('ckeditor5')]).then(
      ([
        { CKEditor },
        {
          DecoupledEditor,
          Essentials,
          Paragraph,
          Bold,
          Italic,
          Heading,
          Link,
          List,
          Indent,
          BlockQuote,
          Table,
          TableToolbar,
          Alignment,
          FontColor,
          FontBackgroundColor,
          Strikethrough,
          Underline,
        },
      ]) => {
        setEditor({
          CKEditor,
          DecoupledEditor: DecoupledEditor as unknown as typeof DecoupledEditorType,
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Heading,
            Link,
            List,
            Indent,
            BlockQuote,
            Table,
            TableToolbar,
            Alignment,
            FontColor,
            FontBackgroundColor,
            Strikethrough,
            Underline,
          ],
        })
      },
    )
  }, [])

  if (!editor) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[300px] text-muted-foreground animate-pulse text-xl">
        {t('loading_editor', { defaultValue: 'Loading editor' })}...
      </div>
    )
  }

  const { CKEditor, DecoupledEditor, plugins } = editor || {}

  return (
    <div className={cn('space-y-2 flex flex-col', className)}>
      {label && <Label className="text-sm font-medium dark:text-white text-title-color">{label}</Label>}
      <div
        className={cn(
          'min-h-[300px] rounded-2xl overflow-hidden border border-glass-border dark:bg-white/3! bg-foreground/3 focus-within:border-primary/50 transition-all flex flex-col',
          error && 'border-destructive/50',
        )}
      >
        {editor 
        // ?
        &&
         (
          <>
            <div ref={toolbarRef} className="ck-toolbar-container border-b border-glass-border bg-transparent" />
            <div className="flex-1 flex flex-col" ref={editorRef}>
              <CKEditor
                editor={DecoupledEditor as any}
                data={value}
                onReady={(editorInstance: any) => {
                  if (toolbarRef.current && editorInstance.ui.view.toolbar?.element) {
                    toolbarRef.current.innerHTML = '' // Prevent duplicates in Strict Mode
                    toolbarRef.current.appendChild(editorInstance.ui.view.toolbar.element)
                  }
                }}
                onChange={(_event: any, editorInstance: any) => {
                  const data = editorInstance.getData()
                  onChange(data)
                }}
                config={{
                  licenseKey: 'GPL',
                  plugins: plugins,
                  placeholder: placeholder || t('start_typing_content', { defaultValue: 'Start typing...' }),
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'strikethrough',
                    'fontColor',
                    'fontBackgroundColor',
                    '|',
                    'link',
                    '|',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'outdent',
                    'indent',
                    '|',
                    'blockQuote',
                    'insertTable',
                    '|',
                    'undo',
                    'redo',
                  ],
                }}
              />
            </div>
          </>
        )
        //  : (
        //   <div className="flex items-center justify-center flex-1 min-h-[300px] text-muted-foreground animate-pulse text-xl">
        //     {t('loading_editor', { defaultValue: 'Loading editor' })}...
        //   </div>
        // )
        }
      </div>
      {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}
    </div>
  )
}
