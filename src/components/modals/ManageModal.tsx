import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { StocksTab } from './StocksTab';
import { APIsTab } from './APIsTab';
import { SettingsTab } from './SettingsTab';

interface ManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageModal({ open, onOpenChange }: ManageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Portfolio</DialogTitle>
          <DialogDescription>
            Add, remove, and organize your stocks and custom data sources
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="stocks" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="apis">Custom APIs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="stocks" className="mt-0">
              <StocksTab />
            </TabsContent>
            <TabsContent value="apis" className="mt-0">
              <APIsTab />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}