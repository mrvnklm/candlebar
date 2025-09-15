# Changelog

All notable changes to Candlebar will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-15

### Added
- Initial release of Candlebar
- Real-time stock price tracking with Yahoo Finance API
- Beautiful dark theme with Shadcn/UI components
- Drag and drop to reorder stocks
- Custom API data sources support
- Import/Export configuration
- Menu bar display with All/Cycle modes
- Keyboard shortcuts (Cmd+R to refresh, Cmd+S for settings)
- Toast notifications for user feedback
- Input validation and sanitization
- Error boundaries for crash protection
- Performance optimizations with React.memo
- Refresh countdown timer
- Support for both Intel and Apple Silicon Macs

### Security
- HTTPS-only API requests
- Input sanitization to prevent XSS
- Blocked local and private network requests
- Secure localStorage for data persistence

### Technical
- Built with React 18 + TypeScript
- Tauri 2.0 for desktop framework
- Zustand for state management
- React Query for data fetching
- Shadcn/UI + Tailwind CSS for UI
- Framer Motion for animations
- Zod for validation