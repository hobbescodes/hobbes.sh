# Telescope Modes

> Extend the search overlay with multiple "pickers" like Telescope.nvim

## Overview

Expand the existing search functionality (`/`) with different modes/pickers that 
can search different data sources. Each mode uses the same Telescope-style UI 
but with mode-specific content and previews.

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `/` | - | Quick find files (current behavior) |
| `:Telescope find_files` | `:Tel ff` | Find files |
| `:Telescope buffers` | `:Tel buf` | Search open buffers |
| `:Telescope marks` | `:Tel m` | Search marks |
| `:Telescope commands` | `:Tel cmd` | Command palette |
| `:Telescope help_tags` | `:Tel help` | Search help topics |
| `:Telescope recent` | `:Tel recent` | Recent files (like `:history`) |
| `:Telescope colorscheme` | `:Tel cs` | Theme picker |

### Alias Pattern

- `:Telescope` → full form
- `:Tel` → short alias
- `:Tele` → medium alias

## Design

### Unified Overlay Structure

All telescope modes use the same split-pane layout:

```
┌─────────────────────────────────────────────────────────────┐
│ ↑↓ navigate    Enter open    Tab switch mode    Esc close   │
├─────────────────────────────────────────────────────────────┤
│                    Find Files                               │  ← Mode indicator
├──────────────────────────┬──────────────────────────────────┤
│ Results (5)              │ Preview                          │
├──────────────────────────┤                                  │
│ > home.md                │  Welcome to hobbescodes          │
│   about.md               │                                  │
│   contact.md             │  This is the home page of my     │
│   projects/              │  terminal-inspired website...    │
│   blog/                  │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ > abo█                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Mode-Specific Content

#### find_files (default `/`)
- **Source**: `getAllRoutes()` from routes.ts
- **Preview**: Page description, type, metadata

#### buffers
- **Source**: `BufferContext.buffers`
- **Preview**: Buffer info, indicators (%a, #)
- **Shortcut**: None (accessed via `:Telescope buffers`)

#### marks
- **Source**: `MarksContext.marks`
- **Preview**: Mark path, creation date
- **Action**: Jump to mark

#### commands
- **Source**: Static command list
- **Preview**: Command description, syntax, examples

#### help_tags
- **Source**: Static help topics (from HelpOverlay categories)
- **Preview**: Relevant help content
- **Action**: Could scroll to section in help overlay

#### recent (oldfiles)
- **Source**: `HistoryContext.entries`
- **Preview**: Relative time, file info
- **This is essentially the existing HistoryOverlay as a Telescope mode**

#### colorscheme
- **Source**: `COLORSCHEMES` from types
- **Preview**: Color swatches, description
- **Action**: Set colorscheme

## Implementation

### Files to Create

1. **`src/components/ui/TelescopeOverlay.tsx`**
   - Main overlay component
   - Accepts `mode` prop
   - Delegates to mode-specific result/preview components

2. **`src/lib/telescope.ts`**
   - Mode definitions
   - Command data
   - Help tags data

### Files to Modify

1. **`src/context/NavigationContext.tsx`**
   - Add `telescopeMode: TelescopeMode | null` state
   - Add command parsing for `:Telescope`, `:Tel`, `:Tele`
   - Reuse `showSearch` or add `showTelescope`

2. **`src/components/ui/SearchOverlay.tsx`**
   - Refactor to accept `mode` prop
   - Or: Replace with TelescopeOverlay

3. **`src/routes/__root.tsx`**
   - Render TelescopeOverlay when active

4. **`src/components/ui/HelpOverlay.tsx`**
   - Add Telescope section with available modes

### Data Structures

```typescript
// src/lib/telescope.ts

export type TelescopeMode = 
  | "find_files" 
  | "buffers" 
  | "marks" 
  | "commands" 
  | "help_tags" 
  | "recent"
  | "colorscheme";

export interface TelescopeItem {
  id: string;
  displayName: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

// Mode aliases for command parsing
export const TELESCOPE_ALIASES: Record<string, TelescopeMode> = {
  find_files: "find_files",
  ff: "find_files",
  files: "find_files",
  buffers: "buffers",
  buf: "buffers",
  marks: "marks",
  m: "marks",
  commands: "commands",
  cmd: "commands",
  help_tags: "help_tags",
  help: "help_tags",
  recent: "recent",
  oldfiles: "recent",
  colorscheme: "colorscheme",
  cs: "colorscheme",
  themes: "colorscheme",
};

// Command palette data
export const COMMANDS: TelescopeItem[] = [
  { id: "q", displayName: ":q", description: "Go to home page" },
  { id: "e", displayName: ":e <path>", description: "Open file by path" },
  { id: "help", displayName: ":help", description: "Show help overlay" },
  { id: "theme", displayName: ":theme", description: "Open theme picker" },
  { id: "marks", displayName: ":marks", description: "Show marks overlay" },
  { id: "ls", displayName: ":ls", description: "Show buffer list" },
  { id: "snake", displayName: ":snake", description: "Play snake game" },
  { id: "term", displayName: ":term", description: "Open interactive terminal" },
  { id: "recent", displayName: ":recent", description: "Show recent files" },
  { id: "delmarks", displayName: ":delmarks!", description: "Delete all marks" },
  // ... more commands
];

// Help tags data
export const HELP_TAGS: TelescopeItem[] = [
  { id: "navigation", displayName: "Navigation", description: "j/k, Enter, -, gx" },
  { id: "history", displayName: "History", description: "Ctrl+o, Ctrl+i, :recent" },
  { id: "marks", displayName: "Marks", description: "m{a-z}, '{a-z}, :marks" },
  { id: "modes", displayName: "Modes", description: ":, /, ?, Esc" },
  { id: "commands", displayName: "Commands", description: ":q, :e, :help, :theme" },
  { id: "buffers", displayName: "Buffers", description: ":ls, :b, Ctrl+^" },
  { id: "projects", displayName: "Projects", description: "^a l/h/x" },
];
```

### Command Parsing

```typescript
// In NavigationContext.executeCommand()

// :Telescope, :Tel, :Tele handling
const teleMatch = cmd.match(/^(?:Telescope|Tel|Tele)\s*(.*)$/i);
if (teleMatch) {
  const modeArg = teleMatch[1].trim().toLowerCase();
  
  if (!modeArg) {
    // No mode specified - could show mode picker or default to find_files
    setTelescopeMode("find_files");
  } else {
    const mode = TELESCOPE_ALIASES[modeArg];
    if (mode) {
      setTelescopeMode(mode);
    } else {
      setCommandError(`E: Unknown telescope mode: ${modeArg}`);
      return;
    }
  }
  
  setMode("NORMAL");
  setShowTelescope(true);
  return;
}
```

### TelescopeOverlay Component

```tsx
// src/components/ui/TelescopeOverlay.tsx

interface TelescopeOverlayProps {
  mode: TelescopeMode;
  onClose: () => void;
  onSelect: (item: TelescopeItem, mode: TelescopeMode) => void;
}

export const TelescopeOverlay: FC<TelescopeOverlayProps> = ({
  mode,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Get items based on mode
  const items = useTelescopeItems(mode, query);
  
  // Get mode-specific title
  const title = getModeTitle(mode);
  
  return (
    <div className="telescope-backdrop" onClick={onClose}>
      <div className="telescope-modal" onClick={e => e.stopPropagation()}>
        {/* Key hints */}
        <KeyHints mode={mode} />
        
        {/* Title */}
        <div className="telescope-title">{title}</div>
        
        {/* Split pane content */}
        <div className="telescope-content">
          {/* Left: Results */}
          <div className="telescope-results">
            <ResultsList 
              items={items} 
              selectedIndex={selectedIndex}
              mode={mode}
            />
          </div>
          
          {/* Right: Preview */}
          <div className="telescope-preview">
            <PreviewPane 
              item={items[selectedIndex]} 
              mode={mode}
            />
          </div>
        </div>
        
        {/* Input */}
        <div className="telescope-input">
          <span>{">"}</span>
          <span>{query}</span>
          <span className="cursor" />
        </div>
      </div>
    </div>
  );
};
```

### Mode-Specific Hooks

```typescript
// Custom hook to get items based on mode
function useTelescopeItems(mode: TelescopeMode, query: string): TelescopeItem[] {
  const { marks } = useMarks();
  const { buffers } = useBuffers();
  const { entries } = useHistory();
  
  return useMemo(() => {
    let items: TelescopeItem[] = [];
    
    switch (mode) {
      case "find_files":
        items = getAllRoutes().map(route => ({
          id: route.path,
          displayName: route.displayName,
          description: route.description || route.title,
          metadata: { type: route.type, path: route.path },
        }));
        break;
        
      case "buffers":
        items = buffers.map((buf, i) => ({
          id: String(buf.id),
          displayName: buf.displayName,
          description: buf.path,
          metadata: { number: i + 1, ...buf },
        }));
        break;
        
      case "marks":
        items = Object.entries(marks).map(([key, mark]) => ({
          id: key,
          displayName: `'${key}`,
          description: mark.displayName,
          metadata: { path: mark.path, createdAt: mark.createdAt },
        }));
        break;
        
      case "commands":
        items = COMMANDS;
        break;
        
      case "help_tags":
        items = HELP_TAGS;
        break;
        
      case "recent":
        items = entries.map(entry => ({
          id: `${entry.path}-${entry.timestamp}`,
          displayName: entry.displayName,
          description: formatRelativeTime(entry.timestamp),
          metadata: entry,
        }));
        break;
        
      case "colorscheme":
        items = COLORSCHEMES.map(cs => ({
          id: cs,
          displayName: COLORSCHEME_META[cs].label,
          description: COLORSCHEME_META[cs].description,
          metadata: { background: COLORSCHEME_META[cs].background },
        }));
        break;
    }
    
    // Filter by query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(item => 
        item.displayName.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
      );
    }
    
    return items;
  }, [mode, query, marks, buffers, entries]);
}
```

### Selection Actions

```typescript
// Handle item selection based on mode
function handleSelect(item: TelescopeItem, mode: TelescopeMode) {
  switch (mode) {
    case "find_files":
    case "recent":
      navigate({ to: item.metadata?.path as string });
      break;
      
    case "buffers":
      switchToBuffer(item.metadata?.id as number);
      break;
      
    case "marks":
      navigate({ to: item.metadata?.path as string });
      break;
      
    case "commands":
      // Execute the command
      executeCommand(item.id);
      break;
      
    case "help_tags":
      // Show help overlay scrolled to section
      setShowHelp(true);
      // Future: scroll to specific section
      break;
      
    case "colorscheme":
      setColorscheme(item.id as Colorscheme);
      break;
  }
}
```

## Mode-Specific Preview Components

### Commands Preview

```tsx
const CommandPreview: FC<{ item: TelescopeItem }> = ({ item }) => (
  <div className="space-y-3">
    <div className="text-lg font-bold" style={{ color: "var(--blue)" }}>
      {item.displayName}
    </div>
    <div style={{ color: "var(--text)" }}>
      {item.description}
    </div>
    {/* Could add examples, related commands, etc. */}
  </div>
);
```

### Colorscheme Preview

```tsx
const ColorschemePreview: FC<{ item: TelescopeItem }> = ({ item }) => (
  <div className="space-y-3">
    <div className="text-lg font-bold" style={{ color: "var(--green)" }}>
      {item.displayName}
    </div>
    <div style={{ color: "var(--subtext0)" }}>
      {item.description}
    </div>
    {/* Color swatches */}
    <div className="flex gap-2">
      {/* Show sample colors for this scheme */}
    </div>
  </div>
);
```

## Testing Checklist

- [ ] `/` still works as quick find_files
- [ ] `:Telescope` with no arg defaults to find_files
- [ ] `:Telescope buffers` shows open buffers
- [ ] `:Tel buf` alias works
- [ ] `:Telescope marks` shows marks (empty state if none)
- [ ] `:Telescope commands` shows all commands
- [ ] `:Telescope help_tags` shows help topics
- [ ] `:Telescope recent` shows history (like :history)
- [ ] `:Telescope colorscheme` shows themes
- [ ] All modes filter by query
- [ ] Enter selects and performs correct action
- [ ] Escape closes overlay
- [ ] Preview updates on selection change
- [ ] Invalid mode shows error

## Future Enhancements

- Tab to cycle between modes
- `:Telescope` with no arg shows mode picker
- Live preview for colorscheme (preview without selecting)
- `:Telescope grep` - search file contents
- `:Telescope keymaps` - show all keybindings
- Mode indicator in input area

## Dependencies

- BufferContext (for buffers mode) - implement Plan 02 first
- MarksContext (for marks mode)
- HistoryContext (for recent mode)
- ThemeContext (for colorscheme mode)

## Estimated Effort

- **TelescopeOverlay component**: 2-3 hours
- **telescope.ts data/types**: 1 hour
- **Mode-specific hooks**: 1-2 hours
- **Preview components**: 1-2 hours
- **Command parsing**: 30 minutes
- **Testing**: 1 hour
- **Total**: ~7-9 hours
