import React from 'react';
import { DataItem } from './DataItem';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStockStore } from '@/lib/store';
import type { Stock } from '@/types';

interface DataListItem {
  id: string;
  type: 'stock' | 'custom';
  symbol: string;
  alias?: string;
  price?: number;
  changePercent?: number;
  value?: number | string;
  decimals?: number;
  error?: string | null;
}

interface DataListProps {
  items: DataListItem[];
  isLoading?: boolean;
}

export function DataList({ items, isLoading }: DataListProps) {
  const { entrySpacing } = useStockStore();
  
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

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-muted-foreground">No data to display</div>
        <div className="text-xs text-muted-foreground mt-2">
          Click the gear icon to add stocks or custom APIs
        </div>
      </Card>
    );
  }

  return (
    <div className={getSpacingClass()}>
      {items.map((item) => (
        <DataItem
          key={item.id}
          type={item.type}
          symbol={item.symbol}
          alias={item.alias}
          price={item.price}
          changePercent={item.changePercent}
          value={item.value}
          decimals={item.decimals}
          error={item.error}
        />
      ))}
    </div>
  );
}