# Feature: Interactive Terminal Easter Egg (`:term`)

> A fake shell inside the terminal with fun commands and a simulated filesystem

---

## Overview

Implement an interactive terminal mode accessed via `:term` that presents a bash-like shell experience. Users can type commands that return fun, thematic responses while exploring a simulated filesystem representing the site owner's interests, skills, and personality.

### User Experience

```bash
# Enter terminal mode:
:term

# In terminal:
hobbescodes@website:~$ whoami
🐯 hobbescodes
Tiger by day, developer by night.

hobbescodes@website:~$ ls
about/  projects/  skills/  interests/  .secrets/  readme.txt

hobbescodes@website:~$ cd skills
hobbescodes@website:~/skills$ ls
typescript.txt  rust.txt  react.txt  neovim.txt  go.txt

hobbescodes@website:~/skills$ cat typescript.txt
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ 90%
My daily driver. Types make everything better.

hobbescodes@website:~$ neofetch
# Shows ASCII tiger + system info

hobbescodes@website:~$ cowsay hello world
# Tiger says "hello world"

hobbescodes@website:~$ exit
# Returns to normal mode
```

---

## Technical Design

### 1. Virtual Filesystem Structure

```typescript
interface VFSNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;           // For files
  children?: VFSNode[];       // For directories
  hidden?: boolean;           // For dotfiles
}

const virtualFS: VFSNode = {
  type: 'directory',
  name: '~',
  children: [
    {
      type: 'directory',
      name: 'about',
      children: [
        { type: 'file', name: 'bio.txt', content: '...' },
        { type: 'file', name: 'location.txt', content: '...' },
      ]
    },
    {
      type: 'directory', 
      name: 'skills',
      children: [
        { type: 'file', name: 'typescript.txt', content: '...' },
        { type: 'file', name: 'rust.txt', content: '...' },
        // ...
      ]
    },
    {
      type: 'directory',
      name: 'projects',
      children: [
        { type: 'file', name: 'ark-ui.txt', content: '...' },
        // Could dynamically pull from actual projects
      ]
    },
    {
      type: 'directory',
      name: 'interests',
      children: [
        { type: 'file', name: 'gaming.txt', content: '...' },
        { type: 'file', name: 'music.txt', content: '...' },
        { type: 'file', name: 'coffee.txt', content: '...' },
      ]
    },
    {
      type: 'directory',
      name: '.secrets',
      hidden: true,
      children: [
        { type: 'file', name: 'konami.txt', content: 'You found the secret!' },
      ]
    },
    { type: 'file', name: 'readme.txt', content: 'Welcome to my terminal...' },
    { type: 'file', name: '.bashrc', hidden: true, content: '# Tiger mode activated' },
  ]
};
```

### 2. Command Registry

```typescript
interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  execute: (args: string[], context: TerminalContext) => CommandResult;
}

interface CommandResult {
  output: string | React.ReactNode;  // What to display
  clearScreen?: boolean;              // For 'clear' command
  exit?: boolean;                     // For 'exit' command
  newCwd?: string;                    // For 'cd' command
}

interface TerminalContext {
  cwd: string;                        // Current working directory
  fs: VFSNode;                        // Virtual filesystem
  history: string[];                  // Command history
  env: Record<string, string>;        // Environment variables
}
```

### 3. Supported Commands

#### Navigation & Filesystem
| Command | Description | Example |
|---------|-------------|---------|
| `ls [-a]` | List directory contents | `ls`, `ls -a` (show hidden) |
| `cd <dir>` | Change directory | `cd skills`, `cd ..`, `cd ~` |
| `pwd` | Print working directory | `pwd` |
| `cat <file>` | Display file contents | `cat readme.txt` |
| `tree` | Display directory tree | `tree` |

#### Fun Commands
| Command | Description | Output |
|---------|-------------|--------|
| `whoami` | Display identity | Tiger ASCII + "hobbescodes" |
| `neofetch` | System info display | ASCII tiger + "specs" about the developer |
| `cowsay <msg>` | Tiger says message | ASCII speech bubble |
| `fortune` | Random quote/joke | Programming quotes, tiger facts |
| `date` | Current date/time | Formatted timestamp |
| `echo <text>` | Print text | Echoes input |
| `clear` | Clear terminal | Clears output history |
| `help` | List commands | Shows available commands |
| `exit` | Exit terminal | Returns to normal mode |

#### Easter Eggs (Hidden)
| Command | Description |
|---------|-------------|
| `sudo <anything>` | "Nice try..." response |
| `rm -rf /` | Humorous refusal |
| `vim` | "You're already in vim... sort of" |
| `emacs` | Playful jab |
| `:(){ :\|:& };:` | "Fork bomb detected..." |
| `hackerman` | ASCII art easter egg |

### 4. Terminal Component

```typescript
// src/components/terminal/InteractiveTerminal.tsx

interface InteractiveTerminalProps {
  onExit: () => void;
}

interface TerminalState {
  history: OutputLine[];      // Command outputs
  inputBuffer: string;        // Current input
  commandHistory: string[];   // Previous commands (for up/down)
  historyIndex: number;       // Position in command history
  cwd: string;                // Current directory
}

interface OutputLine {
  type: 'prompt' | 'output' | 'error';
  content: string | React.ReactNode;
}
```

### 5. UI Design

```
┌─────────────────────────────────────────────────────────────────┐
│ 👻 ~/hobbescodes/term                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Welcome to hobbescodes terminal!                                │
│ Type 'help' for available commands.                             │
│                                                                 │
│ hobbescodes@website:~$ ls                                       │
│ about/  projects/  skills/  interests/  readme.txt              │
│                                                                 │
│ hobbescodes@website:~$ cd skills                                │
│ hobbescodes@website:~/skills$ cat typescript.txt                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ 90%                                        │
│ My daily driver. Types make everything better.                  │
│                                                                 │
│ hobbescodes@website:~/skills$ _                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ~/skills                         [term] utf-8      TERM   1:1   │
└─────────────────────────────────────────────────────────────────┘
```

Features:
- Scrollable output history
- Blinking cursor at input line
- Prompt shows current directory: `hobbescodes@website:{cwd}$`
- Command history with up/down arrows
- Tab completion (stretch goal)
- Colored output (green for success, red for errors, etc.)

### 6. ASCII Art Assets

#### Tiger for `neofetch`:
```
      |\      _,,,---,,_
ZZZzz /,`.-'`'    -.  ;-;;,_
     |,4-  ) )-,_. ,\ (  `'-'
    '---''(_/--'  `-'\_)

hobbescodes@website
------------------
OS: hobbescodes.dev
Shell: vim-mode 1.0
Theme: Catppuccin Mocha
Terminal: Ghostty
Languages: TypeScript, Rust, Go
Editor: Neovim btw
Uptime: since 1995
```

#### Tiger for `cowsay`:
```
 _______________
< hello world! >
 ---------------
    \
     \  |\      _,,,---,,_
       /,`.-'`'    -.  ;-;;,_
      |,4-  ) )-,_. ,\ (  `'-'
     '---''(_/--'  `-'\_)
```

### 7. Route & Navigation Mode

- New route: `/game/term` (or reuse game pattern)
- New navigation mode: `TERM` (added to NavigationMode union)
- Mode prevents normal vim keybindings from interfering
- Only `Escape` (held) or `exit` command can exit

---

## Implementation Steps

### Phase 1: Core Infrastructure
1. [ ] Create `src/lib/terminal/filesystem.ts` - Virtual filesystem definition
2. [ ] Create `src/lib/terminal/commands.ts` - Command registry and implementations
3. [ ] Create `src/lib/terminal/types.ts` - Shared types

### Phase 2: Terminal Component
4. [ ] Create `src/components/terminal/InteractiveTerminal.tsx`
   - State management (history, input, cwd)
   - Input handling
   - Output rendering
   - Scrolling behavior

5. [ ] Create `src/routes/game/term.tsx` - Route for terminal

### Phase 3: Commands - Filesystem
6. [ ] Implement `ls` command (with -a flag)
7. [ ] Implement `cd` command (with .., ~, absolute paths)
8. [ ] Implement `pwd` command
9. [ ] Implement `cat` command
10. [ ] Implement `tree` command

### Phase 4: Commands - Fun
11. [ ] Implement `whoami` command with ASCII art
12. [ ] Implement `neofetch` command with tiger ASCII
13. [ ] Implement `cowsay` command with tiger
14. [ ] Implement `fortune` command with quotes array
15. [ ] Implement `date`, `echo`, `clear`, `help`, `exit`

### Phase 5: Polish & Easter Eggs
16. [ ] Add `TERM` mode to NavigationContext
17. [ ] Implement command history (up/down arrows)
18. [ ] Add hidden easter egg commands
19. [ ] Style output with Catppuccin colors
20. [ ] Add `:term` command in NavigationContext

### Phase 6: Content
21. [ ] Write filesystem content (skills, interests, about, etc.)
22. [ ] Create fortune quotes array
23. [ ] Fine-tune ASCII art

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/terminal/filesystem.ts` | **CREATE** - Virtual filesystem |
| `src/lib/terminal/commands.ts` | **CREATE** - Command implementations |
| `src/lib/terminal/types.ts` | **CREATE** - Types |
| `src/lib/ascii/tiger.ts` | **CREATE** - Tiger ASCII variants |
| `src/components/terminal/InteractiveTerminal.tsx` | **CREATE** - Main component |
| `src/routes/game/term.tsx` | **CREATE** - Route |
| `src/context/NavigationContext.tsx` | **MODIFY** - Add TERM mode, :term command |
| `src/types/index.ts` | **MODIFY** - Add terminal types if needed |

---

## Edge Cases & Considerations

1. **Long output**: Ensure scrolling works for commands with lots of output (tree, help)
2. **Invalid commands**: Show helpful "command not found" message with suggestions
3. **Path resolution**: Handle `../../../..` gracefully (don't go above ~)
4. **Special characters**: Escape or handle quotes, pipes, etc. gracefully
5. **Mobile**: Consider if this should be accessible on mobile (probably keyboard-only)

---

## Content Ideas for Filesystem

### ~/skills/
- `typescript.txt` - Proficiency bar + description
- `rust.txt` - "Learning and loving it"
- `react.txt` - "Building UIs since 2018"
- `neovim.txt` - "I use Neovim btw"
- `go.txt` - "For when I need speed"

### ~/interests/
- `gaming.txt` - Favorite games
- `music.txt` - Genres, artists
- `coffee.txt` - "Fuel for code"
- `mechanical-keyboards.txt` - Because of course

### ~/about/
- `bio.txt` - Short bio
- `location.txt` - Where based
- `contact.txt` - Links

### ~/.secrets/
- Hidden files with easter eggs
- `konami.txt` - "↑↑↓↓←→←→BA"
- `.plan` - Old school Unix reference

---

## Future Enhancements (Not in Scope)

- Tab completion for commands and paths
- Pipe support (`ls | grep txt`)
- Persistent command history (localStorage)
- Custom aliases
- More games (`:term tetris`?)
- Multiplayer terminal? (websocket chat)
