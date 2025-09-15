import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STOCK_LOGOS } from '@/lib/constants';
import type { Stock } from '@/types';

interface StockItemProps {
  stock: Stock;
  alias?: string;
}

export const StockItem = React.memo(function StockItem({ stock, alias }: StockItemProps) {
  const changePercent = stock.changePercent || stock.change_percent || 0;
  const isPositive = changePercent >= 0;
  const logoUrl = STOCK_LOGOS[stock.symbol];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={stock.symbol}
              className="h-8 w-8 rounded-full bg-white p-1 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
          <div>
            <div className="font-semibold text-sm">{alias || stock.symbol}</div>
            {alias && (
              <div className="text-xs text-muted-foreground">{stock.symbol}</div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold">${stock.price.toFixed(2)}</div>
          <div
            className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded',
              isPositive
                ? 'text-green-500 bg-green-500/10'
                : 'text-red-500 bg-red-500/10'
            )}
          >
            {Math.abs(changePercent).toFixed(2)}%
          </div>
        </div>
      </div>
    </Card>
    </motion.div>
  );
});