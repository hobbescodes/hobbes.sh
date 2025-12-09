---
title: Building a Terminal-Inspired Website
description: How I built this website to look and feel like Neovim in a terminal
date: 2024-12-08
tags: [react, typescript, design, neovim]
readingTime: 5 min read
---

# Building a Terminal-Inspired Website

## The Inspiration

As a developer who spends most of their time in the terminal,
I wanted my personal website to reflect that aesthetic.

This site is designed to look like Ghostty running Neovim with oil.nvim.
Every interaction is keyboard-driven, just like the real thing.


## The Tech Stack

### Frontend
  - TanStack Start for full-stack React
  - Tailwind CSS v4 for styling
  - TypeScript for type safety

### Design
  - Catppuccin Mocha color scheme
  - JetBrains Mono font
  - Custom terminal chrome


## Key Features

  - oil.nvim-style navigation with j/k/Enter/-
  - Vim command line with :q and :help
  - Telescope-style fuzzy finder with /
  - Line numbers on every page


## Example Code

Here is how the navigation context works:

```typescript
const { mode, setMode } = useNavigation()

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (mode !== "NORMAL") return
    if (e.key === ":") {
      setMode("COMMAND")
    }
  }
  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [mode])
```


## What I Learned

Building this site taught me a lot about:

  - Managing keyboard state globally
  - Creating accessible keyboard-only interfaces
  - Mimicking terminal aesthetics on the web


## Conclusion

This was a fun project that combines my love of terminals
with modern web development. Check out the source code
on GitHub!
