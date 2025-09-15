import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStockStore } from '@/lib/store';
import type { DisplayMode } from '@/types';

interface BottomBarProps {
  lastUpdated: Date | null;
}

export function BottomBar({ lastUpdated }: BottomBarProps) {
  const { displayMode, setDisplayMode, refreshInterval } = useStockStore();
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(refreshInterval);

  useEffect(() => {
    if (!lastUpdated) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      const remaining = Math.max(0, refreshInterval - elapsed);
      setTimeUntilRefresh(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, refreshInterval]);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never updated';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) {
      return `Updated ${diff}s ago`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `Updated ${minutes}m ago`;
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(lastUpdated)}</span>
          {lastUpdated && timeUntilRefresh > 0 && (
            <span className="text-xs text-muted-foreground">
              • Next in {timeUntilRefresh}s
            </span>
          )}
        </div>
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          <Button
            variant={displayMode === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDisplayMode('all')}
            className="h-7 px-3 text-xs"
          >
            All
          </Button>
          <Button
            variant={displayMode === 'cycle' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDisplayMode('cycle')}
            className="h-7 px-3 text-xs"
          >
            Cycle
          </Button>
        </div>
      </div>
    </div>
  );
}