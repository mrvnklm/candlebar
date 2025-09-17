import React from 'react';
import { StockItem } from './StockItem';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStockStore } from '@/lib/store';
import type { Stock } from '@/types';

interface StockListProps {
  stocks: Stock[];
  isLoading?: boolean;
}

export function StockList({ stocks, isLoading }: StockListProps) {
  const { symbolAliases, entrySpacing } = useStockStore();
  
  const getSpacingClass = () => {
    switch (entrySpacing) {
      case 'compact': return 'space-y-1';
      case 'normal': return 'space-y-2';
      case 'relaxed': return 'space-y-4';
    }
  };

  if (isLoading) {
    return (
      <div className={getSpacingClass()}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-muted-foreground">No stocks to display</div>
        <div className="text-xs text-muted-foreground mt-2">
          Click the gear icon to add stocks
        </div>
      </Card>
    );
  }

  return (
    <div className={getSpacingClass()}>
      {stocks.map((stock) => (
        <StockItem
          key={stock.symbol}
          stock={stock}
          alias={symbolAliases[stock.symbol]}
        />
      ))}
    </div>
  );
}