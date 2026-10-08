import Label from "@/components/ui/label";
import { SliderRowProps } from "@/types/components/features";

export const SliderRow = ({ label, value, unit = '%', children }: SliderRowProps) => (
  <div className="space-y-4 group">
    <div className="flex justify-between items-center pl-1">
      <Label className="text-sm font-black text-subtitle-color group-hover:text-primary transition-colors">
        {label}
      </Label>
      <div className="flex items-center gap-1 bg-black/5 dark:bg-black/40 px-2.5 py-1 rounded-xl border border-glass-border/50 group-hover:border-primary/50 transition-all">
        <span className="text-[10px] font-black text-primary tabular-nums">
          {value}
        </span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase">
          {unit}
        </span>
      </div>
    </div>
    <div className="px-1">
      {children}
    </div>
  </div>
)