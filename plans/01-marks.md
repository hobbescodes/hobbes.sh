# Feature: Vim-Style Marks System

> Bookmark pages with `m{a-z}` and jump to them with `'{a-z}` - persisted to localStorage

---

## Overview

Implement vim-style marks that allow users to bookmark any page on the site and quickly jump back to it. Marks are single lowercase letters (a-z) that map to route paths, persisted in localStorage.

### User Experience

```
# On /projects/ark-ui page:
ma                    # Set mark 'a' to current page

# Later, from anywhere:
'a                    # Jump to /projects/ark-ui

# View all marks:
:marks                # Opens marks overlay showing all set marks

# Delete a mark:
:delmarks a           # Remove mark 'a'
:delmarks!            # Remove ALL marks
```

---

## Technical Design

### 1. Storage Format

```typescript
// localStorage key
const MARKS_STORAGE_KEY = "hobbescodes-marks";

// Storage structure
interface StoredMarks {
  [key: string]: {        // key is single letter a-z
    path: string;         // route path e.g., "/projects/ark-ui"
    displayName: string;  // for display in :marks overlay
    createdAt: string;    // ISO timestamp
  }
}

// Example stored value:
{
  "a": { "path": "/projects/ark-ui", "displayName": "ark-ui.md", "createdAt": "2024-12-10T..." },
  "b": { "path": "/about", "displayName": "about.md", "createdAt": "2024-12-10T..." }
}
```

### 2. New Context: MarksContext

Create a new context to manage marks state and provide methods to components.

```typescript
// src/context/MarksContext.tsx

interface Mark {
  path: string;
  displayName: string;
  createdAt: string;
}

interface MarksContextValue {
  marks: Record<string, Mark>;      // All marks
  setMark: (key: string, path: string, displayName: string) => void;
  getMark: (key: string) => Mark | undefined;
  deleteMark: (key: string) => void;
  deleteAllMarks: () => void;
  hasMark: (key: string) => boolean;
}
```

### 3. Keyboard Handling Changes

Modify `NavigationContext.tsx` to handle mark-related keys:

#### Setting Marks (`m{a-z}`)
- Add new pending operator `m`
- When `m` is pressed in NORMAL mode, set `pendingOperator = "m"`
- When next key is `a-z`, call `setMark(key, currentPath, currentDisplayName)`
- Show brief confirmation in command line: `Mark 'a' set`

#### Jumping to Marks (`'{a-z}`)
- Add new pending operator `'` (apostrophe)
- When `'` is pressed in NORMAL mode, set `pendingOperator = "'"`
- When next key is `a-z`, look up mark and navigate if exists
- If mark doesn't exist, show error: `E20: Mark not set`

### 4. New Commands

Add to `executeCommand` in NavigationContext:

| Command | Action |
|---------|--------|
| `:marks` | Open marks overlay |
| `:delmarks {a-z}` | Delete specific mark |
| `:delmarks!` | Delete all marks |

### 5. MarksOverlay Component

Create new overlay component similar to HelpOverlay:

```typescript
// src/components/ui/MarksOverlay.tsx

interface MarksOverlayProps {
  onClose: () => void;
  onJumpToMark: (key: string) => void;
}
```

#### Display Format (vim-like)
```
┌─────────────────────────────────────────────┐
│                    Marks                    │
├─────────────────────────────────────────────┤
│  mark   file                         line   │
├─────────────────────────────────────────────┤
│   a     ~/hobbescodes/projects/ark-ui.md    │
│   b     ~/hobbescodes/about.md              │
│   p     ~/hobbescodes/projects/             │
├─────────────────────────────────────────────┤
│  Press mark letter to jump · Esc to close   │
└─────────────────────────────────────────────┘
```

Features:
- Show marks sorted alphabetically by key
- Pressing a mark letter (a-z) jumps directly to that mark
- Escape closes overlay
- If no marks set, show "No marks set" message

---

## Implementation Steps

### Phase 1: Core Infrastructure
1. [ ] Create `src/context/MarksContext.tsx`
   - localStorage read/write helpers
   - Context provider with all methods
   - Hook `useMarks()`

2. [ ] Add MarksProvider to `__root.tsx` (wrap inside NavigationProvider)

### Phase 2: Setting & Jumping to Marks
3. [ ] Add `pendingOperator` handling for `m` key in NavigationContext
4. [ ] Add `pendingOperator` handling for `'` key in NavigationContext
5. [ ] Wire up mark setting to MarksContext
6. [ ] Wire up mark jumping with navigation
7. [ ] Add visual feedback in CommandLine for mark operations

### Phase 3: Marks Overlay
8. [ ] Create `src/components/ui/MarksOverlay.tsx`
9. [ ] Add `showMarks` state to NavigationContext (similar to `showHelp`)
10. [ ] Add `:marks` command to executeCommand
11. [ ] Render MarksOverlay in Terminal.tsx

### Phase 4: Mark Management Commands
12. [ ] Add `:delmarks {letter}` command parsing
13. [ ] Add `:delmarks!` command for clearing all marks

### Phase 5: Polish
14. [ ] Update HelpOverlay to include marks keybindings
15. [ ] Add marks section to help: `m{a-z}` set mark, `'{a-z}` jump to mark, `:marks` show all

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/context/MarksContext.tsx` | **CREATE** - New context for marks |
| `src/components/ui/MarksOverlay.tsx` | **CREATE** - Marks display overlay |
| `src/context/NavigationContext.tsx` | **MODIFY** - Add m/' pending operators, :marks command |
| `src/components/terminal/Terminal.tsx` | **MODIFY** - Render MarksOverlay |
| `src/components/ui/HelpOverlay.tsx` | **MODIFY** - Add marks keybindings |
| `src/routes/__root.tsx` | **MODIFY** - Add MarksProvider |

---

## Edge Cases & Considerations

1. **Mark overwrite**: Setting a mark that already exists should silently overwrite it (vim behavior)
2. **Invalid paths**: If user navigates to a marked path that no longer exists (e.g., deleted blog post), show error and optionally offer to delete the stale mark
3. **Case sensitivity**: Only lowercase a-z are valid mark keys
4. **Special marks**: Consider reserving some marks for special purposes in future (e.g., `'` for last jump position) - for now, keep it simple with just a-z

---

## Future Enhancements (Not in Scope)

- Uppercase marks (A-Z) for cross-session "file marks" that also remember line position
- `''` to jump to position before last jump
- `` ` `` (backtick) vs `'` distinction (exact position vs line start)
- Export/import marks
