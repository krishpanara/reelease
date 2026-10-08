'use client'

import { Badge } from '@/components/ui/badge'
import Input from '@/components/ui/input'
import { Permission, TransformedPermission } from '@/types/role'
import { Check, Minus, Search, ShieldCheck } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { PermissionPickerProps } from '@/types/permission'

const CustomCheckbox = memo(({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) => {
  return (
    <div
      className={cn(
        "relative h-4 w-4 shrink-0 rounded border transition-all flex items-center justify-center",
        checked || indeterminate
          ? "primary-btn text-white"
          : "bg-white dark:bg-white/3 border-glass-border group-hover:border-primary"
      )}
    >
      {checked && !indeterminate && <Check className="h-3 w-3 stroke-[4px]" />}
      {indeterminate && <Minus className="h-3 w-3 stroke-[4px]" />}
    </div>
  )
})
CustomCheckbox.displayName = 'CustomCheckbox'

const SubmoduleItem = memo(({ sub, isSelected, onToggle, disabled }: { sub: any; isSelected: boolean; onToggle: (id: string) => void, disabled?: boolean }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-radius transition-all cursor-pointer group hover:bg-primary/5 border border-glass-button",
        isSelected ? "bg-primary/5 border-primary/20" : ""
      )}
      onClick={(e) => {
        if (disabled) return
        e.preventDefault()
        onToggle(sub.id)
      }}
    >
      <CustomCheckbox checked={isSelected} />
      <span className="text-xs font-medium text-foreground capitalize select-none flex-1 truncate">
        {sub.name.split(' ').slice(0, 1).join(' ')}
      </span>
    </div>
  )
})
SubmoduleItem.displayName = 'SubmoduleItem'

const ModuleCard = memo(({
  perm,
  selectedIds,
  onToggleModule,
  onToggleId,
  disabled
}: {
  perm: TransformedPermission;
  selectedIds: Set<string>;
  onToggleModule: (perm: TransformedPermission) => void;
  onToggleId: (id: string) => void;
  disabled?: boolean
}) => {
  const idsInModule = useMemo(() => perm.submodules.map((s: any) => s.id), [perm.submodules])
  const selectedInModuleCount = useMemo(() => idsInModule.filter((id) => selectedIds.has(id)).length, [idsInModule, selectedIds])

  const isAllSelected = idsInModule.length > 0 && selectedInModuleCount === idsInModule.length
  const isIndeterminate = !isAllSelected && selectedInModuleCount > 0

  return (
    <div className="rounded-[12px] border border-glass-border bg-white/50 dark:bg-white/3 p-4 space-y-3 hover:border-primary/30 transition-all">
      <div
        className="flex items-center justify-between gap-2 pb-2 border-b border-glass-border cursor-pointer group"
        onClick={(e) => {
          if (disabled) return
          e.preventDefault()
          onToggleModule(perm)
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <CustomCheckbox checked={isAllSelected} indeterminate={isIndeterminate} />
          <span className="text-sm font-bold capitalize text-title-color dark:text-white select-none transition-colors group-hover:text-primary">
            {perm.module.replace(/_/g, ' ')}
          </span>
        </div>
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {perm.submodules.map((sub: any) => (
          <SubmoduleItem
            key={sub.id}
            sub={sub}
            isSelected={selectedIds.has(sub.id)}
            onToggle={onToggleId}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
})
ModuleCard.displayName = 'ModuleCard'



const PermissionPicker = ({ permissions = [], selectedIds = [], onChange, disabled }: PermissionPickerProps) => {
  const [search, setSearch] = useState('')
  const [selection, setSelection] = useState<Set<string>>(new Set(selectedIds))

  useEffect(() => {
    setSelection(new Set(selectedIds))
  }, [selectedIds])

  // Transform flat permissions into grouped modules
  const transformedPermissions = useMemo(() => {
    const grouped: Record<string, TransformedPermission> = {}

    permissions.forEach(p => {
      const parts = p.slug.split('.')
      const moduleName = parts.length > 1 ? parts[1] : 'general'

      if (!grouped[moduleName]) {
        grouped[moduleName] = {
          _id: moduleName, // using module name as id for grouping
          module: moduleName,
          submodules: []
        }
      }

      grouped[moduleName].submodules.push({
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description
      } as any)
    })

    return Object.values(grouped)
  }, [permissions])

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return transformedPermissions
    const q = search.toLowerCase()
    return transformedPermissions
      .map((perm) => ({
        ...perm,
        submodules: perm.submodules.filter(
          (sub: any) =>
            perm.module.toLowerCase().includes(q) ||
            sub.name.toLowerCase().includes(q) ||
            sub.slug.toLowerCase().includes(q)
        ),
      }))
      .filter((perm) => perm.submodules.length > 0)
  }, [transformedPermissions, search])

  // Pre-calculate maps for dependent permission logic (View must be selected if any other is)
  const { idToViewIdMap, viewIdToOtherIdsMap } = useMemo(() => {
    const idToView: Record<string, string> = {}
    const viewToOthers: Record<string, string[]> = {}

    transformedPermissions.forEach((perm) => {
      const viewSub = perm.submodules.find((s: any) => s.slug.startsWith('view'))
      if (viewSub) {
        const others: string[] = []
        perm.submodules.forEach((sub: any) => {
          idToView[sub.id] = viewSub.id
          if (sub.id !== viewSub.id) {
            others.push(sub.id)
          }
        })
        viewToOthers[viewSub.id] = others
      }
    })

    return { idToViewIdMap: idToView, viewIdToOtherIdsMap: viewToOthers }
  }, [transformedPermissions])

  const onToggleId = useCallback(
    (id: string) => {
      const next = new Set(selection)
      const viewId = idToViewIdMap[id]

      if (next.has(id)) {
        next.delete(id)
        if (id === viewId) {
          const others = viewIdToOtherIdsMap[id] || []
          others.forEach((s) => next.delete(s))
        }
      } else {
        next.add(id)
        if (viewId) {
          next.add(viewId)
        }
      }

      setSelection(next)
      onChange(Array.from(next))
    },
    [selection, onChange, idToViewIdMap, viewIdToOtherIdsMap]
  )

  const onToggleModule = useCallback(
    (perm: TransformedPermission) => {
      const idsInModule = perm.submodules.map((s: any) => s.id)
      const allSelected = idsInModule.every((id) => selection.has(id))

      const next = new Set(selection)
      if (allSelected) {
        idsInModule.forEach((id) => next.delete(id))
      } else {
        idsInModule.forEach((id) => next.add(id))
      }

      setSelection(next)
      onChange(Array.from(next))
    },
    [selection, onChange]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-5 sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="pl-9 h-11 bg-white/50 dark:bg-white/3 border-glass-border transition-all focus-visible:ring-primary/20"
          />
        </div>

        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground transition-all",
            selection.size > 0 ? "opacity-100" : "opacity-0"
          )}
        >
          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 font-bold px-3">
            {selection.size}
          </Badge>
          permission(s) selected
        </div>
      </div>

      <div className="grid md575:grid-cols-1 xl1519:grid-cols-2 xl:grid-cols-3 gap-4 max-h-125 overflow-y-auto pr-2 no-scrollbar p-1">
        {filteredPermissions.map((perm) => (
          <ModuleCard
            key={perm.module}
            perm={perm}
            selectedIds={selection}
            onToggleModule={onToggleModule}
            onToggleId={onToggleId}
            disabled={disabled}
          />
        ))}

        {filteredPermissions.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground text-sm bg-secondary/5 rounded-lg border border-dashed border-glass-border">
            No permissions found matching &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  )
}

export default PermissionPicker
