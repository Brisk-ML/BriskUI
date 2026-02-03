# Brisk - Web UI

## Tech Stack

- Vite 7.3.0
- React 19.2.3
- React Router v7.11.0
- Tailwind CSS 4.1.18
- Zustand 5.0.9
- shadcn/ui + Radix UI
- TypeScript 5.9.3
- Biome 2.3.10

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
npm run dev
```

Dev server runs at http://localhost:3000

## Project Structure

```
brisk/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   └── globals.css
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── stores/
│   │   │   └── page.tsx
│   │   ├── algorithms/
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── stores/
│   │   │   ├── types.ts
│   │   │   ├── utils/
│   │   │   └── page.tsx
│   │   ├── datasets/
│   │   │   ├── components/
│   │   │   ├── stores/
│   │   │   └── page.tsx
│   │   ├── experiments/
│   │   │   └── page.tsx
│   │   ├── files/
│   │   │   ├── components/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── page.tsx
│   │   ├── metrics/
│   │   │   └── page.tsx
│   │   ├── project/
│   │   │   ├── components/
│   │   │   │   ├── algorithms/
│   │   │   │   ├── data-processing/
│   │   │   │   ├── datasets/
│   │   │   │   ├── experiments/
│   │   │   │   ├── project-setup/
│   │   │   │   ├── report/
│   │   │   │   ├── sync/
│   │   │   │   └── workflow/
│   │   │   ├── stores/
│   │   │   └── page.tsx
│   │   ├── results/
│   │   │   └── page.tsx
│   │   ├── save/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── algorithms/
│   │   │   ├── layout/
│   │   │   ├── modals/
│   │   │   ├── ui/
│   │   │   └── ProgressTracker.tsx
│   │   └── stores/
│   ├── lib/
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── biome.json
```

## Features

- Dashboard with stats and project overview
- Project setup wizard
- Experiments, datasets, and algorithms management
- File browser and metrics viewer

## Path Aliases

`@/*` → `./src/*`

## License

MIT
