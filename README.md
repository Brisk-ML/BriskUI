# Brisk UI

Local web interface for the Brisk.

## Prerequisites

You need Node.js and npm installed. Here's how to set them up:

### Arch Linux

```bash
sudo pacman -S nodejs npm
```

### macOS

```bash
brew install node
```

### Verify installation

```bash
node --version   # Should show v18+ or v20+
npm --version    # Should show 9+ or 10+
```

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   This opens your browser to `http://localhost:5173` with hot reloading enabled.

3. **Build for production**

   ```bash
   npm run build
   ```

   Creates optimized static files in `dist/` that can be served by the Python backend.

## Project Structure

```
brisk-ui/
├── index.html          # Entry HTML file
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main application component
    └── index.css       # Global styles
```
