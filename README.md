# hobbescodes Personal Website

A terminal-inspired personal website that mimics **Ghostty + Neovim + oil.nvim**, built with TanStack Start and Tailwind v4.

## 🎨 Design Philosophy

This site is designed to look and feel like a Ghostty terminal running Neovim with oil.nvim for file navigation. It features:

- **Terminal Shell**: macOS-style window chrome with traffic lights
- **Oil Navigation**: Directory-style keyboard navigation (j/k/Enter/-)
- **Buffer View**: Content rendered as Neovim buffers with line numbers
- **Keyboard-First**: All navigation is keyboard-driven
- **Catppuccin Mocha Theme**: Custom Ghostty overrides with Tokyo Night accents

## 🚀 Tech Stack

| Technology                                           | Purpose                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| [TanStack Start](https://tanstack.com/start)         | Full-stack React framework with SSR           |
| [TanStack Router](https://tanstack.com/router)       | File-based routing                            |
| [Tailwind CSS v4](https://tailwindcss.com/)          | Styling with custom theme tokens              |
| [Biome](https://biomejs.dev/)                        | Linting and formatting                        |
| [Knip](https://knip.dev/)                            | Finds unused files, exports, and dependencies |
| [Bun](https://bun.sh/)                               | JavaScript runtime and package manager        |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Monospace font for terminal aesthetic         |

## 📁 Project Structure

```
src/
├── components/
│   ├── terminal/          # Terminal shell, title bar, status line
│   ├── editor/            # Buffer, line numbers, command line
│   ├── oil/               # Oil.nvim-style navigation
│   ├── preview/           # GitHub repo preview (github1s iframe)
│   ├── game/              # Snake game easter egg
│   └── ui/                # Shared UI components
├── context/               # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, content loaders, routes
├── routes/                # TanStack Router file-based routes
├── server/                # Server functions (GitHub API, cookies)
└── types/                 # TypeScript type definitions
```

## 🎮 Keyboard Navigation

### Oil Navigation (Directory Listings)

| Key       | Action                                           |
| --------- | ------------------------------------------------ |
| `j` / `↓` | Move selection down                              |
| `k` / `↑` | Move selection up                                |
| `Enter`   | Navigate to selected entry                       |
| `-`       | Go to parent directory                           |
| `0-9`     | Vim count prefix (e.g., `5j` moves down 5 lines) |

### Split Panes (Projects Preview)

| Key        | Action             |
| ---------- | ------------------ |
| `Ctrl+a h` | Focus left pane    |
| `Ctrl+a l` | Focus right pane   |
| `Ctrl+a x` | Close preview pane |

### Buffer Navigation

| Key       | Action      |
| --------- | ----------- |
| `j` / `↓` | Scroll down |
| `k` / `↑` | Scroll up   |

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime)

### Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev

# The app will be available at http://localhost:3000
```

### Available Scripts

```bash
bun dev              # Start dev server on port 3000
bun build            # Production build
bun preview          # Preview production build
bun check            # Run Biome linting and formatting checks
bun check:fix        # Auto-fix linting and formatting issues
bun knip             # Find unused files, exports, and dependencies
```

### Code Quality

This project uses:

- **Biome** for linting and formatting (run `bun check` before committing)
- **Knip** for detecting unused code (run `bun knip` to find unused files, exports, and dependencies)
- **TypeScript** for type safety

## 🎨 Theme Customization

The site uses **Catppuccin Mocha** with custom Ghostty overrides. Colors are defined in `src/styles.css` as CSS custom properties:

```css
--background: #08071c; /* Custom Ghostty background */
--cursor: #7aa2f7; /* Tokyo Night blue cursor */
--text: #cdd6f4; /* Catppuccin text */
--blue: #89b4fa; /* Links, functions */
--mauve: #cba6f7; /* Keywords */
--green: #a6e3a1; /* Strings */
/* ... and more */
```

## 📝 Adding Content

### Blog Posts

Blog posts are markdown files in `content/blog/` with frontmatter:

```markdown
---
title: Your Post Title
description: Brief description
date: 2024-12-08
tags: [tag1, tag2]
readingTime: 5 min read
---

# Your Post Title

Content here...
```

### Static Pages

Edit markdown files in `content/`:

- `content/about.md` - About page
- `content/contact.md` - Contact page
- `content/home.md` - Home page welcome text

### Projects

Projects are fetched from the GitHub API (mock data in `src/lib/projects.config.ts`). Each project can be previewed using a github1s.com iframe.

## 📚 Architecture

See [AGENTS.md](./AGENTS.md) for detailed architecture documentation, including:

- Component structure
- Routing & navigation patterns
- Content management
- Design system
- Implementation phases

## 📄 License

This project is open source and available under the MIT License.

---

Built with 💙 by [hobbescodes](https://github.com/hobbescodes)
