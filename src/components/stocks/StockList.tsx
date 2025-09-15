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
  const { symbolAliases, customDataSources, customDataValues } = useStockStore();

  if (isLoading) {
    return (
      <div className="space-y-2">
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

  if (stocks.length === 0 && customDataSources.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-muted-foreground">No data to display</div>
        <div className="text-xs text-muted-foreground mt-2">
          Click the gear icon to add stocks
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {stocks.map((stock) => (
        <StockItem
          key={stock.symbol}
          stock={stock}
          alias={symbolAliases[stock.symbol]}
        />
      ))}
      {customDataSources.map((source) => {
        const value = customDataValues[source.name];
        if (!value) return null;
        
        return (
          <Card key={source.name} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500" />
                <div>
                  <div className="font-semibold text-sm">{source.alias || source.name}</div>
                  <div className="text-xs text-muted-foreground">Custom API</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-500">
                  {typeof value.value === 'number'
                    ? `$${value.value.toFixed(value.decimals)}`
                    : value.value}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}