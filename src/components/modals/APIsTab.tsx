import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { testCustomAPI } from '@/lib/api';

export function APIsTab() {
  const { customDataSources, addCustomAPI, removeCustomAPI } = useStockStore();
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [url, setUrl] = useState('');
  const [path, setPath] = useState('');
  const [decimals, setDecimals] = useState('2');
  const [deleteAPI, setDeleteAPI] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleAddAPI = () => {
    if (name && url && path) {
      addCustomAPI({
        name: name.trim(),
        alias: alias.trim() || name.trim(),
        url: url.trim(),
        path: path.trim(),
        decimals: parseInt(decimals) || 2,
      });
      setName('');
      setAlias('');
      setUrl('');
      setPath('');
      setDecimals('2');
    }
  };

  const handleTest = async () => {
    if (!url || !path) {
      alert('Please enter both URL and JSON path');
      return;
    }

    setTesting(true);
    try {
      const value = await testCustomAPI(url, path);
      alert(`Test successful!\nExtracted value: ${value}`);
    } catch (error) {
      alert(`Test failed!\n${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Name (e.g., portfolio)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-[1fr,auto] gap-2">
          <Input
            placeholder="Display Name (e.g., My Portfolio)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Decimals"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className="w-20"
            min="0"
            max="10"
          />
        </div>
        <Input
          placeholder="API URL (https://api.example.com/data)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Input
          placeholder="JSON Path (e.g., data[0].value or response.price)"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test'}
        </Button>
        <Button onClick={handleAddAPI} className="flex-1">
          Add API
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {customDataSources.map((source) => (
          <Card key={source.name} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{source.alias || source.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {source.url}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => setDeleteAPI(source.name)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAPI} onOpenChange={() => setDeleteAPI(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Custom API</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteAPI}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAPI && removeCustomAPI(deleteAPI)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}