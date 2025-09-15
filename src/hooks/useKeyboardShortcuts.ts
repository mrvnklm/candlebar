import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const isCtrlPressed = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
        const isShiftPressed = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          isCtrlPressed &&
          isShiftPressed &&
          !event.altKey // Avoid conflicts with browser shortcuts
        ) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}