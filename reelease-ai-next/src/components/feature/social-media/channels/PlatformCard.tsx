'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformCardProps } from '@/types/socialMedia'
import { cn } from '@/lib/utils'
import { Loader2, Plus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  isConnected,
  isConnecting,
  connectedAccounts,
  onConnect,
  onDisconnect,
}) => {
  const Icon = platform.icon

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-radius', platform.bgColor, platform.color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{platform.name}</CardTitle>
            {platform.isAvailable && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-5 uppercase tracking-wider font-bold">
                Stable
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs line-clamp-2 mt-1">
            {platform.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button
            variant="secondary"
            className="w-full h-11 font-medium text-base bg-primary! text-white dark:text-black"
            onClick={() => onConnect(platform.id)}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className=" h-4 w-4" />
            )}
            Connect your account
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Connected Accounts
              </span>
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/40 group transition-all hover:border-border/80"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border/40">
                      <AvatarImage src={account.profile_picture || ''} />
                      <AvatarFallback className="text-[10px]">{account.account_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold truncate max-w-[120px]">
                        {account.account_name}
                      </span>
                      {account.account_username && (
                        <span className="text-[10px] text-muted-foreground">
                          @{account.account_username}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDisconnect(account.id, account.account_name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full h-10 text-xs font-medium border-dashed hover:bg-secondary/50"
              onClick={() => onConnect(platform.id)}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Plus className="mr-2 h-3 w-3" />
              )}
              Connect another account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PlatformCard
