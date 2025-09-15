import React, { useState } from 'react';
import { Trash2, Edit2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStockStore } from '@/lib/store';
import { STOCK_LOGOS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { validateStockSymbol, sanitizeInput } from '@/lib/validation';

interface SortableStockItemProps {
  symbol: string;
  alias?: string;
  onEdit: (symbol: string) => void;
  onDelete: (symbol: string) => void;
}

function SortableStockItem({ symbol, alias, onEdit, onDelete }: SortableStockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: symbol });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const logoUrl = STOCK_LOGOS[symbol];

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "p-3",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={symbol}
            className="h-6 w-6 rounded-full bg-white p-0.5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1">
          <div className="font-medium text-sm">{symbol}</div>
          {alias && (
            <div className="text-xs text-muted-foreground">{alias}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(symbol)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => onDelete(symbol)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

export function StocksTab() {
  const { stockSymbols, symbolAliases, addStock, removeStock, updateAlias, reorderStocks } = useStockStore();
  const [newSymbol, setNewSymbol] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [deleteSymbol, setDeleteSymbol] = useState<string | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editAlias, setEditAlias] = useState('');
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddStock = () => {
    const validation = validateStockSymbol(newSymbol);
    
    if (!validation.success) {
      toast({
        title: "Invalid stock symbol",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    const symbol = validation.data!;
    
    if (stockSymbols.includes(symbol)) {
      toast({
        title: "Stock already exists",
        description: `${symbol} is already in your portfolio`,
        variant: "destructive",
      });
      return;
    }
    
    const sanitizedAlias = newAlias ? sanitizeInput(newAlias) : undefined;
    addStock(symbol, sanitizedAlias);
    setNewSymbol('');
    setNewAlias('');
    toast({
      title: "Stock added",
      description: `${symbol} has been added to your portfolio`,
    });
  };

  const handleDeleteStock = (symbol: string) => {
    removeStock(symbol);
    setDeleteSymbol(null);
    toast({
      title: "Stock removed",
      description: `${symbol} has been removed from your portfolio`,
    });
  };

  const handleEditAlias = (symbol: string) => {
    updateAlias(symbol, editAlias);
    setEditingSymbol(null);
    setEditAlias('');
    toast({
      title: "Display name updated",
      description: `Display name for ${symbol} has been updated`,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stockSymbols.indexOf(active.id as string);
      const newIndex = stockSymbols.indexOf(over.id as string);
      const newOrder = arrayMove(stockSymbols, oldIndex, newIndex);
      reorderStocks(newOrder);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Symbol (e.g., AAPL)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
          maxLength={5}
        />
        <Input
          placeholder="Display Name (optional)"
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
        />
      </div>
      <Button onClick={handleAddStock} className="w-full">
        Add Stock
      </Button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stockSymbols}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stockSymbols.map((symbol) => (
              <SortableStockItem
                key={symbol}
                symbol={symbol}
                alias={symbolAliases[symbol]}
                onEdit={(s) => {
                  setEditingSymbol(s);
                  setEditAlias(symbolAliases[s] || '');
                }}
                onDelete={(s) => setDeleteSymbol(s)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSymbol} onOpenChange={() => setDeleteSymbol(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteSymbol} from your portfolio?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteSymbol && handleDeleteStock(deleteSymbol)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Alias Dialog */}
      <AlertDialog open={!!editingSymbol} onOpenChange={() => setEditingSymbol(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Display Name</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a display name for {editingSymbol}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={editAlias}
            onChange={(e) => setEditAlias(e.target.value)}
            placeholder="Display Name"
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => editingSymbol && handleEditAlias(editingSymbol)}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}