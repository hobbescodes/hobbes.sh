# AGENTS.md - Personal Website Architecture Guide

> A terminal-inspired personal website that mimics Ghostty + Neovim + oil.nvim
> Built with TanStack Start, Tailwind v4, and shadcn/ui

---

## Project Overview

This is a personal website designed to look and feel like a Ghostty terminal running Neovim. The site uses oil.nvim-style keyboard navigation for routing, displays content as neovim buffers with line numbers, and includes a vim-style command line interface.

### Core Concepts

- **Terminal Shell**: The entire app is wrapped in a terminal window with macOS-style chrome
- **Oil Navigation**: Routes are presented as directories; users navigate with j/k/Enter
- **Buffer View**: Content pages render like neovim buffers with line numbers and syntax highlighting
- **Keyboard-First**: All navigation is keyboard-driven (no mouse support initially)

### Persona

The site owner's online persona is a **tiger that is also a developer/programmer**. ASCII art and branding should reflect this theme. The brand name is **HobbesCodes**.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| TanStack Start | Full-stack React framework with SSR |
| TanStack Router | File-based routing |
| Tailwind CSS v4 | Styling with custom theme tokens |
| shadcn/ui | Accessible UI primitives (installed incrementally via CLI) |
| JetBrains Mono | Monospace font for terminal aesthetic |
| TypeScript | Type safety throughout |

### Future Additions (Not Yet Implemented)

- PostgreSQL + Drizzle ORM (for blog posts)
- GitHub API integration (for projects)

---

## Design System

### Color Palette: Catppuccin Mocha (with Ghostty overrides)

```css
:root {
  /* Custom Ghostty overrides */
  --background: #08071c;        /* Main terminal background */
  --cursor: #7aa2f7;            /* Cursor color (Tokyo Night blue) */
  
  /* Catppuccin Mocha Base Colors */
  --base: #1e1e2e;              /* Secondary panels */
  --mantle: #181825;            /* Sidebar backgrounds */
  --crust: #11111b;             /* Deepest background */
  
  /* Surfaces */
  --surface0: #313244;          /* Line number gutter bg */
  --surface1: #45475a;          /* Selection background */
  --surface2: #585b70;          /* Inactive elements */
  
  /* Overlays */
  --overlay0: #6c7086;          /* Muted text */
  --overlay1: #7f849c;          /* Line numbers */
  --overlay2: #9399b2;          /* Comments */
  
  /* Text */
  --subtext0: #a6adc8;          /* Secondary text */
  --subtext1: #bac2de;          /* Subtle text */
  --text: #cdd6f4;              /* Primary text */
  
  /* Accent Colors */
  --rosewater: #f5e0dc;
  --flamingo: #f2cdcd;
  --pink: #f5c2e7;              /* Regex, escape sequences */
  --mauve: #cba6f7;             /* Keywords */
  --red: #f38ba8;               /* Errors, symbols */
  --maroon: #eba0ac;            /* Parameters */
  --peach: #fab387;             /* Numbers, constants */
  --yellow: #f9e2af;            /* Classes, types, warnings */
  --green: #a6e3a1;             /* Strings, success */
  --teal: #94e2d5;              /* Enum variants, info */
  --sky: #89dceb;               /* Operators */
  --sapphire: #74c7ec;
  --blue: #89b4fa;              /* Functions, links */
  --lavender: #b4befe;          /* Active line number, borders */
}
```

### Typography

- **Font Family**: `JetBrains Mono`, monospace
- **Base Size**: 14px (desktop), configurable
- **Line Height**: 1.5-1.6 (terminal-like spacing)
- **Tab Width**: 2 spaces equivalent

### Syntax Highlighting (Catppuccin Standard)

| Element | Color |
|---------|-------|
| Keywords | `--mauve` |
| Strings | `--green` |
| Numbers/Constants | `--peach` |
| Functions/Methods | `--blue` |
| Types/Classes | `--yellow` |
| Comments | `--overlay2` |
| Operators | `--sky` |
| Parameters | `--maroon` |
| Errors | `--red` |
| Links | `--blue` |

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── terminal/
│   │   ├── Terminal.tsx           # Main wrapper with macOS chrome
│   │   ├── TitleBar.tsx           # Traffic lights + route title
│   │   ├── TerminalContent.tsx    # Screen area container
│   │   └── StatusLine.tsx         # Vim-style status bar
│   │
│   ├── editor/
│   │   ├── Buffer.tsx             # Content display with line numbers
│   │   ├── LineNumbers.tsx        # Line number gutter
│   │   ├── Cursor.tsx             # Animated cursor
│   │   ├── CommandLine.tsx        # :command input
│   │   └── ModeIndicator.tsx      # NORMAL/INSERT/COMMAND display
│   │
│   ├── oil/
│   │   ├── OilNavigator.tsx       # Directory-style route browser
│   │   ├── OilEntry.tsx           # Single navigable entry
│   │   └── hooks/
│   │       └── useOilNavigation.ts
│   │
│   └── ui/
│       ├── AsciiArt.tsx           # Pre-formatted ASCII display
│       └── SyntaxHighlight.tsx    # Code block highlighting
│
├── context/
│   ├── TerminalContext.tsx        # Global terminal state
│   └── NavigationContext.tsx      # Oil navigation state
│
├── hooks/
│   ├── useKeyboardNavigation.ts   # Global keyboard handler
│   ├── useVimMode.ts              # Mode state management
│   └── useCommandLine.ts          # Command parsing/execution
│
├── lib/
│   ├── content.ts                 # Markdown content loading utilities
│   ├── routes.ts                  # Route tree for oil navigation
│   ├── ascii/
│   │   └── hobbes.ts              # HobbesCodes ASCII art
│   └── utils.ts                   # Shared utilities
│
├── routes/
│   ├── __root.tsx                 # Terminal shell wrapper
│   ├── index.tsx                  # Home page
│   ├── about.tsx
│   ├── contact.tsx
│   ├── projects/
│   │   ├── index.tsx              # Projects list (oil-style)
│   │   └── $slug.tsx              # Individual project
│   └── blog/
│       ├── index.tsx              # Blog list (oil-style)
│       └── $slug.tsx              # Individual post
│
├── styles/
│   └── globals.css                # Tailwind config + custom properties
│
└── types/
    └── index.ts                   # Shared type definitions
```

### Key Components

#### Terminal.tsx

The outermost wrapper that provides the terminal window appearance.

```tsx
// Props
interface TerminalProps {
  children: React.ReactNode
}

// Features
- macOS-style title bar with traffic light buttons (decorative)
- Dynamic title showing current route as file path (e.g., "~/projects/index")
- Contains TerminalContent and StatusLine
```

#### TitleBar.tsx

The macOS-style window chrome.

```tsx
// Display format
"👻 ~/hobbescodes{routePath}"

// Examples
"👻 ~/hobbescodes/"           // Home
"👻 ~/hobbescodes/about.md"   // About page
"👻 ~/hobbescodes/projects/"  // Projects listing
```

#### Buffer.tsx

Displays content in neovim buffer style.

```tsx
interface BufferProps {
  content: string | React.ReactNode
  filetype?: string              // For syntax highlighting hints
  showLineNumbers?: boolean      // Default: true
  startLine?: number             // Default: 1
}

// Layout
┌─────┬────────────────────────────────────┐
│  1  │ Content line 1                     │
│  2  │ Content line 2                     │
│  3  │                                    │
│  ~  │                                    │  <- Empty lines show ~
│  ~  │                                    │
└─────┴────────────────────────────────────┘
```

#### OilNavigator.tsx

The oil.nvim-style directory browser for navigation.

```tsx
interface OilNavigatorProps {
  entries: OilEntry[]
  currentPath: string
}

interface OilEntry {
  name: string
  type: 'directory' | 'file'
  route: string
  icon?: string                  // Optional icon/indicator
}

// Display format (directory view)
~/hobbescodes/
../                              <- Parent directory
 about.md
 contact.md
 projects/
 blog/

// Keyboard bindings
j     - Move selection down
k     - Move selection up
Enter - Navigate to selected
-     - Go to parent directory
/     - Start search filter (future)
```

#### StatusLine.tsx

Vim-style status line at the bottom.

```tsx
// Format
{filepath}                    {filetype} {encoding}  {mode}  {line}:{col}

// Example
~/hobbescodes/about.md            [markdown] utf-8       NORMAL  42:1
```

#### CommandLine.tsx

The `:` command input area.

```tsx
// Supported commands (Phase 1)
:q      - Navigate to home
:help   - Show help overlay
:e {path} - Navigate to path (future)

// Display
:q█                            <- Cursor at end
```

---

## Routing & Navigation

### Route Tree

```
/                    -> ~/hobbescodes/
/about              -> ~/hobbescodes/about.md
/contact            -> ~/hobbescodes/contact.md
/projects           -> ~/hobbescodes/projects/
/projects/:slug     -> ~/hobbescodes/projects/{slug}.md
/blog               -> ~/hobbescodes/blog/
/blog/:slug         -> ~/hobbescodes/blog/{slug}.md
```

### Oil Navigation Data Structure

```typescript
// lib/routes.ts

export interface RouteEntry {
  name: string
  displayName: string           // What shows in oil navigator
  type: 'directory' | 'file'
  path: string                  // TanStack Router path
  children?: RouteEntry[]
}

export const routeTree: RouteEntry = {
  name: 'website',
  displayName: '~/',
  type: 'directory',
  path: '/',
  children: [
    { name: 'about', displayName: 'about.md', type: 'file', path: '/about' },
    { name: 'contact', displayName: 'contact.md', type: 'file', path: '/contact' },
    { 
      name: 'projects', 
      displayName: 'projects/', 
      type: 'directory', 
      path: '/projects',
      children: [] // Populated dynamically
    },
    { 
      name: 'blog', 
      displayName: 'blog/', 
      type: 'directory', 
      path: '/blog',
      children: [] // Populated dynamically
    },
  ]
}
```

### Keyboard Navigation State

```typescript
// context/NavigationContext.tsx

interface NavigationState {
  currentPath: string           // Current route path
  selectedIndex: number         // Currently highlighted item in oil
  mode: 'NORMAL' | 'COMMAND' | 'SEARCH'
  commandBuffer: string         // Current command input
  searchQuery: string           // Current search filter
}
```

---

## Content Structure

### Projects Data (GitHub API Ready)

```typescript
// content/projects/index.ts

export interface Project {
  // GitHub API mappable fields
  name: string                  // repo.name
  description: string           // repo.description
  url: string                   // repo.html_url
  homepage?: string             // repo.homepage
  language?: string             // repo.language
  stars: number                 // repo.stargazers_count
  forks: number                 // repo.forks_count
  topics: string[]              // repo.topics
  updatedAt: string             // repo.updated_at
  
  // Custom fields (stored separately or in repo description)
  featured?: boolean
  order?: number
}

// Mock data structure
export const projects: Project[] = [
  {
    name: 'awesome-project',
    description: 'A really cool project that does things',
    url: 'https://github.com/username/awesome-project',
    homepage: 'https://awesome-project.dev',
    language: 'TypeScript',
    stars: 42,
    forks: 5,
    topics: ['react', 'typescript', 'cli'],
    updatedAt: '2024-01-15T00:00:00Z',
    featured: true,
    order: 1,
  },
  // ... more projects
]
```

### Content Structure (Markdown Files)

Static content is stored as markdown files in the `content/` directory:

```
content/
├── about.md           # About page content (pure markdown)
├── contact.md         # Contact page content (pure markdown)
└── blog/
    ├── post-slug.md   # Blog posts with frontmatter
    └── ...
```

Blog posts use frontmatter for metadata:

```markdown
---
title: Post Title
description: Brief description
date: 2024-12-08
tags: [tag1, tag2]
readingTime: 5 min read
---

# Post Title

Content here...
```

Content is loaded via `src/lib/content.ts`:
- `loadPageContent(filename)` - Load about.md, contact.md
- `loadBlogPost(slug)` - Load a blog post with frontmatter
- `getAllBlogPosts()` - Get all blog post metadata for listings

---

## ASCII Art: HobbesCodes Banner

```
  _   _       _     _                ____          _           
 | | | | ___ | |__ | |__   ___  ___ / ___|___   __| | ___  ___ 
 | |_| |/ _ \| '_ \| '_ \ / _ \/ __| |   / _ \ / _` |/ _ \/ __|
 |  _  | (_) | |_) | |_) |  __/\__ \ |__| (_) | (_| |  __/\__ \
 |_| |_|\___/|_.__/|_.__/ \___||___/\____\___/ \__,_|\___||___/
```

---

## Implementation Phases

### Phase 1: Foundation (Current Priority)

1. **Terminal Shell Setup**
   - [x] Create Terminal component with macOS title bar
   - [x] Implement TitleBar with traffic lights + dynamic route title
   - [x] Create TerminalContent container
   - [x] Build StatusLine component
   - [x] Set up global CSS with Catppuccin theme tokens
   - [x] Configure JetBrains Mono font

2. **Oil Navigation**
   - [x] Create OilNavigator component
   - [x] Create OilEntry component
   - [x] Implement useKeyboardNavigation hook
   - [x] Set up NavigationContext
   - [x] Wire up j/k/Enter/- keybindings
   - [x] Connect navigation to TanStack Router

3. **Buffer Display**
   - [x] Create Buffer component
   - [x] Create LineNumbers component
   - [x] Style line number gutter
   - [x] Handle content overflow/scrolling

4. **Home Page**
   - [x] Create ASCII art HobbesCodes component
   - [x] Build welcome message content
   - [x] Integrate oil navigator on home page
   - [x] Show navigation instructions

### Phase 2: Content Pages

1. **Static Pages**
   - [x] About page with markdown content
   - [x] Contact page with markdown content

2. **Dynamic Listings**
   - [ ] Projects index with oil-style listing
   - [ ] Individual project pages
   - [ ] Blog index (placeholder)
   - [ ] Individual blog post template

### Phase 3: Polish

1. **Command Line**
   - [ ] CommandLine component
   - [ ] Command parsing
   - [ ] `:q` and `:help` commands
   - [ ] Mode switching (NORMAL <-> COMMAND)

2. **Visual Polish**
   - [ ] Cursor animation
   - [ ] Page transition effects
   - [ ] Search mode (`/` key)
   - [ ] Help overlay (`?` key)

3. **Code Highlighting**
   - [ ] Syntax highlighting for code blocks
   - [ ] Support common languages

### Phase 4: Future Enhancements

- [ ] GitHub API integration for projects
- [ ] PostgreSQL + Drizzle for blog
- [ ] Mobile responsiveness
- [ ] Theme switching (Catppuccin flavors)
- [ ] Multiplexer/split panes

---

## Code Patterns & Conventions

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: `types/index.ts` or colocated

### Component Structure

```tsx
// Standard component template
import { type FC } from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // Props definition
}

export const Component: FC<ComponentProps> = ({ prop }) => {
  // Implementation
  return (
    <div className={cn('base-classes')}>
      {/* Content */}
    </div>
  )
}
```

### Styling Approach

- Use Tailwind utility classes as primary styling method
- Use CSS custom properties for theme colors
- Use `cn()` utility for conditional classes
- Avoid inline styles except for dynamic values

```tsx
// Good
<div className="bg-[--surface0] text-[--text]">

// Avoid
<div style={{ backgroundColor: '#313244' }}>
```

### Keyboard Event Handling

```tsx
// Global keyboard handler pattern
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't capture if user is typing in an input
    if (e.target instanceof HTMLInputElement) return
    
    switch (e.key) {
      case 'j':
        // Move down
        break
      case 'k':
        // Move up
        break
      case 'Enter':
        // Navigate
        break
      case '-':
        // Go to parent
        break
      case ':':
        // Enter command mode
        e.preventDefault()
        break
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [dependencies])
```

---

## shadcn/ui Integration

shadcn/ui is initialized in the project and components are added incrementally as needed via the CLI:

```bash
bunx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/` and can be customized to match the Catppuccin theme.

---

## Environment & Configuration

### Required Environment Variables (Future)

```bash
# GitHub API (for projects)
GITHUB_TOKEN=
GITHUB_USERNAME=

# Database (for blog)
DATABASE_URL=

# Optional
SITE_URL=https://example.com
```

### Development Commands

```bash
bun dev        # Start dev server on port 3000
bun build      # Production build
bun preview    # Preview production build
bun test       # Run tests
```

---

## Notes for AI Agents

1. **Always reference this file** before making architectural decisions
2. **Maintain keyboard-first approach** - no mouse interactions initially
3. **Follow Catppuccin color scheme** - use CSS variables, not hardcoded hex
4. **Keep content in TypeScript files** for now (not MDX/markdown)
5. **Projects data structure must remain GitHub API compatible**
6. **Title bar should always reflect current route** as a file path with ghost emoji: `👻 ~/hobbescodes{path}`
7. **Status line format is fixed** - don't deviate from the specified layout
8. **Oil navigation uses j/k/Enter/-** - these are non-negotiable keybindings
9. **Add shadcn components incrementally** via `bunx shadcn@latest add <component>`
10. **ASCII banner is "HobbesCodes"** - tiger/developer persona
