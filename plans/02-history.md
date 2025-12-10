# Feature: Navigation History (Jumplist)

> Track navigation history with `Ctrl+o` (back) and `Ctrl+i` (forward), plus `:recent` telescope picker

---

## Overview

Implement vim-style jumplist navigation that tracks where users have been and allows quick back/forward movement. Session-only (not persisted), tracking up to 50 entries.

### User Experience

```
# Navigate around the site:
/                     # Home
/projects             # Projects list  
/projects/ark-ui      # Project detail
/about                # About page

# Jump back through history:
Ctrl+o                # → /projects/ark-ui
Ctrl+o                # → /projects
Ctrl+o                # → /

# Jump forward:
Ctrl+i                # → /projects
Ctrl+i                # → /projects/ark-ui

# Open history picker:
:recent               # Opens telescope-style history picker
:history              # Alias for :recent
```

---

## Technical Design

### 1. Data Structure

```typescript
interface HistoryEntry {
  path: string;           // Route path
  displayName: string;    // For display (e.g., "about.md")
  timestamp: number;      // When visited (for sorting/display)
}

interface HistoryState {
  entries: HistoryEntry[];  // All history entries (max 50)
  currentIndex: number;     // Current position in history (-1 = at head)
}
```

#### How the Jumplist Works

The jumplist maintains a list and a cursor position:

```
entries: ["/", "/projects", "/projects/ark-ui", "/about"]
                                                    ^
                                          currentIndex: 3 (at head)

# After Ctrl+o (jump back):
entries: ["/", "/projects", "/projects/ark-ui", "/about"]
                                  ^
                        currentIndex: 2

# After Ctrl+o again:
entries: ["/", "/projects", "/projects/ark-ui", "/about"]
                    ^
          currentIndex: 1

# After Ctrl+i (jump forward):
entries: ["/", "/projects", "/projects/ark-ui", "/about"]
                                  ^
                        currentIndex: 2
```

When navigating to a NEW page (not via Ctrl+o/i):
- If `currentIndex` is not at head, truncate entries after currentIndex
- Add new entry at end
- Set currentIndex to new head

### 2. New Context: HistoryContext

```typescript
// src/context/HistoryContext.tsx

const MAX_HISTORY_ENTRIES = 50;

interface HistoryContextValue {
  // State
  entries: HistoryEntry[];
  currentIndex: number;
  
  // Actions
  pushEntry: (path: string, displayName: string) => void;  // Called on navigation
  jumpBack: () => string | null;      // Ctrl+o - returns path to navigate to
  jumpForward: () => string | null;   // Ctrl+i - returns path to navigate to
  
  // Derived
  canJumpBack: boolean;
  canJumpForward: boolean;
}
```

### 3. Integration Points

#### Recording Navigation

Navigation recording should happen when:
- User clicks/enters a route (oil navigation)
- User uses `:e <path>` command
- User selects from search (`/`) overlay
- User jumps to a mark (`'a`)

Navigation should NOT be recorded when:
- User uses `Ctrl+o` / `Ctrl+i` (traversing history)
- Initial page load (debatable - could record first page)

#### Where to Hook

Option A: In NavigationContext's `setMode("NORMAL")` after navigation
Option B: Create a custom hook `useRecordNavigation()` called in route components
Option C: Listen to TanStack Router's navigation events

**Recommended: Option C** - Use router subscription to catch all navigation:

```typescript
// In HistoryProvider
const router = useRouter();

useEffect(() => {
  return router.subscribe('onResolved', ({ toLocation }) => {
    // Record navigation unless it's from jumplist traversal
    if (!isJumplistNavigation.current) {
      pushEntry(toLocation.pathname, getDisplayName(toLocation.pathname));
    }
    isJumplistNavigation.current = false;
  });
}, [router]);
```

### 4. Keyboard Handling

Add to NavigationContext's keyboard handler:

```typescript
// In NORMAL mode handling:
if (e.ctrlKey && e.key === 'o') {
  e.preventDefault();
  const targetPath = jumpBack();
  if (targetPath) {
    isJumplistNavigation.current = true;  // Flag to prevent recording
    navigate({ to: targetPath });
  }
}

if (e.ctrlKey && e.key === 'i') {
  e.preventDefault();
  const targetPath = jumpForward();
  if (targetPath) {
    isJumplistNavigation.current = true;
    navigate({ to: targetPath });
  }
}
```

### 5. History/Recent Picker (Telescope-style)

New overlay component similar to SearchOverlay:

```typescript
// src/components/ui/HistoryOverlay.tsx

interface HistoryOverlayProps {
  entries: HistoryEntry[];
  onSelect: (path: string) => void;
  onClose: () => void;
}
```

#### Display Format
```
┌─────────────────────────────────────────────────────────────────┐
│  ↑↓ navigate    Enter open    Esc close                        │
├─────────────────────────────────────────────────────────────────┤
│                        Recent Files                             │
├─────────────────────────────────────────────────────────────────┤
│  Results (12)                    │  Preview                     │
│ ─────────────────────────────────│──────────────────────────────│
│ >  about.md              2m ago │  ~/hobbescodes/about.md      │
│    projects/ark-ui.md    5m ago │                              │
│    projects/             5m ago │  Learn about me, my skills,  │
│    home.md              10m ago │  and my interests            │
│    blog/                15m ago │                              │
│    contact.md           20m ago │  [markdown]                  │
├─────────────────────────────────────────────────────────────────┤
│  > _                                                            │
└─────────────────────────────────────────────────────────────────┘
```

Features:
- Most recent entries at top (or bottom in telescope-reverse style)
- Relative timestamps ("2m ago", "1h ago", etc.)
- Optional filter input (type to filter history)
- j/k or arrow keys to navigate
- Enter to select and navigate
- Shows current position indicator if in middle of jumplist

### 6. Commands

Add to `executeCommand`:

| Command | Action |
|---------|--------|
| `:recent` | Open history picker |
| `:history` | Alias for `:recent` |
| `:jumps` | Alias for `:recent` (vim's actual command) |
| `:clearhistory` | Clear all history (optional) |

---

## Implementation Steps

### Phase 1: Core Infrastructure
1. [ ] Create `src/context/HistoryContext.tsx`
   - HistoryEntry type
   - State management with entries array and currentIndex
   - pushEntry, jumpBack, jumpForward methods
   - Max 50 entries enforcement

2. [ ] Add HistoryProvider to `__root.tsx`

### Phase 2: Navigation Recording
3. [ ] Subscribe to router navigation events in HistoryProvider
4. [ ] Add `isJumplistNavigation` ref to prevent recording during Ctrl+o/i
5. [ ] Create helper to derive displayName from path

### Phase 3: Jump Navigation
6. [ ] Add Ctrl+o handler in NavigationContext
7. [ ] Add Ctrl+i handler in NavigationContext
8. [ ] Wire up to HistoryContext's jumpBack/jumpForward

### Phase 4: History Overlay
9. [ ] Create `src/components/ui/HistoryOverlay.tsx`
10. [ ] Add `showHistory` state to NavigationContext
11. [ ] Add `:recent` / `:history` commands
12. [ ] Render HistoryOverlay in Terminal.tsx
13. [ ] Add keyboard navigation within overlay

### Phase 5: Polish
14. [ ] Add relative time formatting utility
15. [ ] Update HelpOverlay with Ctrl+o/i bindings
16. [ ] Consider visual indicator showing position in jumplist (optional)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/context/HistoryContext.tsx` | **CREATE** - History state management |
| `src/components/ui/HistoryOverlay.tsx` | **CREATE** - Telescope-style picker |
| `src/lib/utils.ts` | **MODIFY** - Add relative time formatter |
| `src/context/NavigationContext.tsx` | **MODIFY** - Add Ctrl+o/i handlers, :recent command |
| `src/components/terminal/Terminal.tsx` | **MODIFY** - Render HistoryOverlay |
| `src/components/ui/HelpOverlay.tsx` | **MODIFY** - Add history keybindings |
| `src/routes/__root.tsx` | **MODIFY** - Add HistoryProvider |

---

## Edge Cases & Considerations

1. **Duplicate entries**: Don't add duplicate if navigating to same page twice in a row
2. **History overflow**: When exceeding 50 entries, remove oldest entries (from beginning)
3. **Jumplist branch**: When jumping back then navigating to new page, truncate forward history (standard jumplist behavior)
4. **Page refresh**: History is lost on refresh (session-only by design)
5. **Invalid paths**: History entries pointing to deleted pages should gracefully fail (navigate anyway, let 404 handle it)

---

## Future Enhancements (Not in Scope)

- Persist history to localStorage (user preference)
- `:oldfiles` command showing history across sessions
- Frecency sorting (frequency + recency) for smarter ordering
- History search/filter in the picker
- Show preview of page content in picker
