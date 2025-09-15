# Candlebar 📊

A modern, elegant stock ticker menu bar application for macOS built with Tauri, React, and TypeScript.

![Candlebar](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)

## ✨ Features

- 📈 **Real-time Stock Tracking** - Monitor your favorite stocks with automatic updates
- 🎨 **Beautiful Dark Theme** - Modern UI with smooth animations powered by Shadcn/UI
- 🔄 **Drag & Drop** - Easily reorder stocks with intuitive drag and drop
- 🌐 **Custom Data Sources** - Add any API endpoint to track custom data
- 💾 **Import/Export** - Save and share your portfolio configuration
- ⌨️ **Keyboard Shortcuts** - Quick actions for power users
- 🔔 **Toast Notifications** - User-friendly feedback for all actions
- 🎯 **Menu Bar Display** - View stocks directly in your menu bar (All or Cycle mode)
- 🛡️ **Secure & Validated** - Input validation, HTTPS-only APIs, error boundaries

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Rust 1.70+
- macOS (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/candlebar.git
cd candlebar

# Install dependencies
npm install

# Run in development mode
npm run dev        # Terminal 1 - Start Vite
npm run tauri:dev  # Terminal 2 - Start Tauri
```

## ⌨️ Keyboard Shortcuts

- `Cmd/Ctrl + R` - Refresh stocks
- `Cmd/Ctrl + S` - Open settings
- `Escape` - Close dialogs

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/UI + Tailwind CSS  
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query with caching
- **Desktop Framework**: Tauri 2.0
- **Animations**: Framer Motion
- **Validation**: Zod

## 📦 Building for Production

```bash
# Build the application
npm run tauri:build

# Output will be in src-tauri/target/release/bundle/
```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```env
VITE_DEFAULT_REFRESH_INTERVAL=30  # Refresh interval (10-300 seconds)
VITE_DEFAULT_STOCKS=AAPL,GOOGL,MSFT,TSLA  # Default stocks
VITE_MAX_STOCKS=20  # Maximum stocks allowed
```

### Custom API Data Sources

Add any JSON API as a data source:

1. Click Settings → Custom APIs
2. Enter your API details:
   - **Name**: Unique identifier
   - **URL**: HTTPS endpoint
   - **JSON Path**: `data.value` or `results[0].price`
   - **Decimals**: Display precision

## 🏗️ Project Structure

```
candlebar/
├── src/                # React application
│   ├── components/    # UI components
│   │   ├── layout/   # Header, BottomBar
│   │   ├── modals/   # Settings dialogs
│   │   ├── stocks/   # Stock display
│   │   └── ui/       # Shadcn components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities, API, validation
│   └── types/        # TypeScript definitions
├── src-tauri/        # Rust backend
│   ├── src/         # Rust source
│   └── capabilities/ # Permissions
└── public/          # Static assets
```

## 🔒 Security Features

- ✅ HTTPS-only API requests
- ✅ Input validation and sanitization
- ✅ No local/private network access
- ✅ Error boundaries for crash protection
- ✅ Secure localStorage persistence
- ✅ XSS prevention

## 🎯 Recent Improvements

- Added error boundaries for crash protection
- Implemented comprehensive input validation
- Optimized with React.memo for better performance
- Added keyboard shortcuts (Cmd+R, Cmd+S)
- Enhanced refresh indicators with countdown
- Improved error messages and recovery
- Added toast notifications for all actions
- Implemented drag & drop for stock reordering

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Tauri](https://tauri.app) - Desktop application framework
- [Shadcn/UI](https://ui.shadcn.com) - Beautiful UI components
- [TradingView](https://tradingview.com) - Stock logo assets
- [Yahoo Finance](https://finance.yahoo.com) - Stock data API