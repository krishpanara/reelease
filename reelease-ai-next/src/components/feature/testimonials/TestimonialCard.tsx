'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { TestimonialCardProps } from "@/types/testimonial"
import { Edit2, Quote, Star, Trash2, User } from "lucide-react"
import Image from "next/image"



const TestimonialCard = ({ testimonial, onEdit, onDelete, onToggleStatus, canUpdate = true, canDelete = true }: TestimonialCardProps) => {

  return (
    <Card className="relative group bg-white/3 overflow-hidden border-glass-border hover-gradient-border glass-card transition-all duration-300 rounded-border-radius sm:p-6 p-4 h-full flex flex-col">
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <div className="absolute -top-4 -left-4 rtl:left-[unset] rtl:-right-4 text-primary/5 -z-10">
          <Quote className="w-16 h-16 rotate-180" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-title-color dark:text-white line-clamp-2 flex-1 wrap-break-word">
          {testimonial.title}
        </h3>

        {canUpdate && (
          <div className="shrink-0 pt-1">
            <Switch
              checked={testimonial.status}
              onCheckedChange={() => onToggleStatus(testimonial)}
              className="data-[state=checked]:bg-primary scale-90"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <p className="text-subtitle-color text-sm leading-relaxed wrap-break-word line-clamp-4 italic">
          {testimonial.description}
        </p>
      </div>
      <div className="flex gap-1 mb-3 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i < (testimonial.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
            )}
          />
        ))}
      </div>
      <div className="mt-auto pt-5 border-t border-glass-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-radius overflow-hidden bg-primary/10 border border-primary/20 shrink-0">
            {testimonial.user_image ? (
              <Image
                src={
                  testimonial.user_image.startsWith('http')
                    ? testimonial.user_image
                    : `${process.env.NEXT_PUBLIC_STORAGE_URL}${testimonial.user_image.startsWith('/') ? '' : '/'}${
                        testimonial.user_image
                      }`
                }
                alt={testimonial.user_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-title-color dark:text-white break-words text-base line-clamp-1">
              {testimonial.user_name}
            </h4>
            <p className="text-muted-foreground text-xs font-medium line-clamp-1 break-words">
              {testimonial.user_post}
            </p>
          </div>
        </div>

        {(canUpdate || canDelete) && (
          <div className="flex items-center gap-1 transition-opacity duration-300">
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(testimonial)}
                className="h-8 w-8 text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(testimonial)}
                className="h-8 w-8 text-destructive bg-destructive/10 rounded-lg hover:bg-destructive hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default TestimonialCard
