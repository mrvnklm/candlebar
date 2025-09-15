import { z } from 'zod';

// Stock symbol validation
export const stockSymbolSchema = z
  .string()
  .min(1, 'Stock symbol is required')
  .max(5, 'Stock symbol must be 5 characters or less')
  .regex(/^[A-Z0-9]+$/, 'Stock symbol must contain only uppercase letters and numbers')
  .transform((val) => val.toUpperCase().trim());

// Alias validation
export const aliasSchema = z
  .string()
  .max(50, 'Display name must be 50 characters or less')
  .optional()
  .transform((val) => val?.trim());

// Custom API validation
export const customAPISchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Name must contain only letters, numbers, hyphens, and underscores'),
  alias: z
    .string()
    .max(50, 'Display name must be 50 characters or less')
    .optional(),
  url: z
    .string()
    .url('Must be a valid URL')
    .startsWith('https://', 'URL must use HTTPS for security'),
  path: z
    .string()
    .min(1, 'JSON path is required')
    .max(200, 'JSON path must be 200 characters or less'),
  decimals: z
    .number()
    .int()
    .min(0, 'Decimals must be 0 or greater')
    .max(10, 'Decimals must be 10 or less')
    .default(2),
});

// Settings validation
export const refreshIntervalSchema = z
  .number()
  .int()
  .min(10, 'Refresh interval must be at least 10 seconds')
  .max(300, 'Refresh interval must be at most 300 seconds');

// Sanitize HTML to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate and sanitize stock symbol
export function validateStockSymbol(symbol: string): { success: boolean; data?: string; error?: string } {
  try {
    const validated = stockSymbolSchema.parse(symbol);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid stock symbol' };
  }
}

// Validate and sanitize API URL
export function validateAPIUrl(url: string): { success: boolean; data?: string; error?: string } {
  try {
    const urlSchema = z.string().url().startsWith('https://');
    const validated = urlSchema.parse(url);
    
    // Additional security checks
    const urlObj = new URL(validated);
    
    // Block localhost and private IPs
    if (urlObj.hostname === 'localhost' || 
        urlObj.hostname === '127.0.0.1' ||
        urlObj.hostname.startsWith('192.168.') ||
        urlObj.hostname.startsWith('10.') ||
        urlObj.hostname.startsWith('172.')) {
      return { success: false, error: 'Cannot use local or private network URLs' };
    }
    
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid URL' };
  }
}