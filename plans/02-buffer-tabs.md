# Buffer Tabs / Buffer Switching

> Track open buffers like vim, with visual tabs and quick switching

## Overview

Implement a vim-style buffer system that tracks visited pages as "open buffers". 
Users can switch between buffers using commands or keyboard shortcuts, and see 
their open buffers in a visual tab bar (vim-airline style).

**Session-only**: Buffers are cleared when the browser is closed/refreshed.

## Keybindings & Commands

| Key/Command | Action |
|-------------|--------|
| `:ls` / `:buffers` / `:buf` | Show buffer list overlay |
| `:b <n>` / `:buffer <n>` | Switch to buffer number `n` |
| `:b <partial>` | Fuzzy match buffer name and switch |
| `:bd` / `:bdelete` | Remove current buffer from list |
| `:bd <n>` | Remove buffer `n` from list |
| `Ctrl+^` / `Ctrl+6` | Switch to alternate (previous) buffer |

## Design

### Buffer Tab Bar (vim-airline style)

Located at the top of the terminal content area, below the title bar.

```
┌──────────────────────────────────────────────────────────────┐
│ 👻 ~/hobbescodes/about.md                              _ □ x │  ← Title bar
├──────────────────────────────────────────────────────────────┤
│ 1:home.md │ 2:about.md │ 3:projects/ │ 4:blog/ │ 5:contact  │  ← Buffer tabs
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Buffer content here...                                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ NORMAL  ~/hobbescodes/about.md           [markdown] 42:1     │  ← Status line
└──────────────────────────────────────────────────────────────┘
```

### Tab Styling

```
Active buffer:    │ 2:about.md │   bg: --surface1, text: --text, border-bottom: --blue
Alternate buffer: │ 1:home.md  │   bg: --surface0, text: --subtext0, # indicator
Other buffers:    │ 3:projects │   bg: --mantle, text: --overlay1
```

### Buffer List Overlay (`:ls`)

```
┌─────────────────────────────────────────┐
│               Buffers                   │
├─────────────────────────────────────────┤
│ Results (5)                             │
├─────────────────────────────────────────┤
│   1  %a  home.md            ~/          │  ← %a = active
│   2  #   about.md           ~/about     │  ← #  = alternate
│   3      projects/          ~/projects  │
│ > 4      blog/              ~/blog      │  ← > = selected
│   5      contact.md         ~/contact   │
├─────────────────────────────────────────┤
│ > █                                     │  ← Filter input
├─────────────────────────────────────────┤
│ j/k navigate  Enter open  d delete  Esc │
└─────────────────────────────────────────┘
```

## Implementation

### Files to Create

1. **`src/context/BufferContext.tsx`**
   - Buffer state management
   - Session-only (no localStorage)

2. **`src/components/terminal/BufferTabs.tsx`**
   - Visual tab bar component
   - Click to switch buffers

3. **`src/components/ui/BufferListOverlay.tsx`**
   - `:ls` / `:buffers` overlay

### Files to Modify

1. **`src/context/NavigationContext.tsx`**
   - Add `:ls`, `:buffers`, `:buf`, `:b`, `:bd`, `:bdelete` command parsing
   - Add `showBufferList: boolean` state
   - Add `Ctrl+^` / `Ctrl+6` keyboard handling

2. **`src/routes/__root.tsx`**
   - Add BufferProvider to provider tree
   - Render BufferTabs component
   - Render BufferListOverlay when active

3. **`src/components/terminal/Terminal.tsx`**
   - Include BufferTabs in layout

4. **`src/components/ui/HelpOverlay.tsx`**
   - Add Buffer section with commands

### Data Structures

```typescript
// src/context/BufferContext.tsx

interface Buffer {
  id: number;              // Unique buffer ID (incrementing)
  path: string;            // Route path
  displayName: string;     // Display name (e.g., "about.md")
  openedAt: number;        // Timestamp when opened
}

interface BufferContextValue {
  // State
  buffers: Buffer[];
  currentBufferId: number | null;
  alternateBufferId: number | null;
  
  // Actions
  switchToBuffer: (id: number) => void;
  switchToAlternate: () => void;
  removeBuffer: (id: number) => void;
  getBufferByPath: (path: string) => Buffer | undefined;
  getBufferByNumber: (n: number) => Buffer | undefined;
  
  // Derived
  currentBuffer: Buffer | null;
  alternateBuffer: Buffer | null;
}

const MAX_BUFFERS = 15; // Remove oldest when exceeded
```

### State Flow

```
1. User navigates to /about
   ↓
2. Router fires onResolved event
   ↓
3. BufferContext checks if /about is already a buffer
   ↓
4. If not, create new buffer with next ID
   ↓
5. Set currentBufferId to new buffer
   ↓
6. Set alternateBufferId to previous currentBufferId
   ↓
7. If buffers.length > MAX_BUFFERS, remove oldest
   ↓
8. BufferTabs re-renders with new buffer list
```

### Command Parsing

```typescript
// In NavigationContext.executeCommand()

// :ls, :buffers, :buf - show buffer list
if (cmdLower === "ls" || cmdLower === "buffers" || cmdLower === "buf") {
  setMode("NORMAL");
  setShowBufferList(true);
  return;
}

// :b <n> or :buffer <n> - switch to buffer
const bufferMatch = cmd.match(/^b(?:uffer)?\s+(.+)$/i);
if (bufferMatch) {
  const arg = bufferMatch[1].trim();
  
  // Try as number first
  const bufNum = parseInt(arg, 10);
  if (!isNaN(bufNum)) {
    window.dispatchEvent(new CustomEvent("buffer-switch", { detail: { number: bufNum } }));
  } else {
    // Fuzzy match by name
    window.dispatchEvent(new CustomEvent("buffer-switch", { detail: { query: arg } }));
  }
  setMode("NORMAL");
  return;
}

// :bd or :bdelete - remove buffer
const deleteMatch = cmd.match(/^bd(?:elete)?(?:\s+(\d+))?$/i);
if (deleteMatch) {
  const bufNum = deleteMatch[1] ? parseInt(deleteMatch[1], 10) : null;
  window.dispatchEvent(new CustomEvent("buffer-delete", { detail: { number: bufNum } }));
  setMode("NORMAL");
  return;
}
```

### Keyboard Handler Updates

```typescript
// In NavigationContext keyboard handler, NORMAL mode

// Ctrl+^ or Ctrl+6 - switch to alternate buffer
if (e.ctrlKey && (e.key === "^" || e.key === "6")) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("buffer-switch-alternate"));
  return;
}
```

### Buffer Tabs Component

```tsx
// src/components/terminal/BufferTabs.tsx

interface BufferTabsProps {
  buffers: Buffer[];
  currentId: number | null;
  alternateId: number | null;
  onSwitch: (id: number) => void;
}

export const BufferTabs: FC<BufferTabsProps> = ({
  buffers,
  currentId,
  alternateId,
  onSwitch,
}) => {
  if (buffers.length === 0) return null;
  
  return (
    <div
      className="flex h-7 items-center overflow-x-auto"
      style={{
        backgroundColor: "var(--mantle)",
        borderBottom: "1px solid var(--surface0)",
      }}
    >
      {buffers.map((buffer, index) => {
        const isCurrent = buffer.id === currentId;
        const isAlternate = buffer.id === alternateId;
        const displayNumber = index + 1;
        
        return (
          <button
            key={buffer.id}
            onClick={() => onSwitch(buffer.id)}
            className="flex h-full items-center gap-1 px-3 text-xs whitespace-nowrap"
            style={{
              backgroundColor: isCurrent 
                ? "var(--surface1)" 
                : isAlternate 
                  ? "var(--surface0)" 
                  : "transparent",
              color: isCurrent 
                ? "var(--text)" 
                : "var(--overlay1)",
              borderBottom: isCurrent 
                ? "2px solid var(--blue)" 
                : "2px solid transparent",
            }}
          >
            <span style={{ color: "var(--overlay0)" }}>{displayNumber}:</span>
            <span>{buffer.displayName}</span>
            {isAlternate && !isCurrent && (
              <span style={{ color: "var(--yellow)" }}>#</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
```

## Styling

### Tab Bar

```css
.buffer-tabs {
  height: 1.75rem;           /* 28px */
  background: var(--mantle);
  border-bottom: 1px solid var(--surface0);
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;     /* Hide scrollbar */
}

.buffer-tab {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.75rem;
  height: 100%;
  white-space: nowrap;
  font-size: 0.75rem;
  border-bottom: 2px solid transparent;
  transition: background-color 0.1s;
}

.buffer-tab:hover {
  background: var(--surface0);
}

.buffer-tab--current {
  background: var(--surface1);
  color: var(--text);
  border-bottom-color: var(--blue);
}

.buffer-tab--alternate {
  background: var(--surface0);
  color: var(--subtext0);
}
```

### Overlay (reuse existing overlay patterns)

Follow the same patterns as `HistoryOverlay.tsx` for consistency.

## Testing Checklist

- [ ] Navigate to 3+ pages, see tabs appear in order
- [ ] Click on a tab to switch to that buffer
- [ ] Current buffer has blue underline
- [ ] Alternate buffer shows `#` indicator
- [ ] `:ls` opens buffer list overlay
- [ ] j/k navigation in buffer list
- [ ] Enter in buffer list switches to selected buffer
- [ ] `:b 2` switches to buffer 2
- [ ] `:b proj` fuzzy matches and switches to projects
- [ ] `Ctrl+^` switches to alternate buffer
- [ ] `:bd` removes current buffer, navigates to alternate
- [ ] `:bd 3` removes buffer 3
- [ ] Refresh page - all buffers cleared (session-only)
- [ ] Max 15 buffers, oldest removed when exceeded
- [ ] Tab bar scrolls horizontally when many buffers

## Edge Cases

- Removing current buffer → switch to alternate, or first available
- Removing alternate buffer → find next most recent
- Only one buffer → `:bd` is a no-op or navigates home
- Navigate to same page twice → don't create duplicate buffer
- Tab bar overflow → horizontal scroll, hide scrollbar

## Future Enhancements

- Tab close buttons (x) on hover
- Drag to reorder tabs
- Tab groups / pinned tabs
- `:bufdo` - run command on all buffers
- `[b` / `]b` - previous/next buffer shortcuts

## Dependencies

- NavigationContext (command parsing)
- Router subscription (for navigation events)

## Estimated Effort

- **BufferContext**: 1-2 hours
- **BufferTabs component**: 1 hour
- **BufferListOverlay**: 1 hour
- **NavigationContext updates**: 30 minutes
- **Integration & layout**: 30 minutes
- **Testing**: 30 minutes
- **Total**: ~5-6 hours
