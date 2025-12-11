# Macro Recording

> Record and replay key sequences like vim's macro system

## Overview

Implement vim's macro recording feature: record sequences of keypresses to a register, 
then replay them on demand. Macros persist to localStorage across sessions.

## Keybindings

| Key | Action |
|-----|--------|
| `q{a-z}` | Start recording to register |
| `q` (while recording) | Stop recording |
| `@{a-z}` | Replay macro from register |
| `@@` | Replay last executed macro |
| `:reg` / `:registers` | Show registers overlay |
| `:delreg {a-z}` | Delete a register |
| `:delreg!` | Delete all registers |

## Design

### Recording Indicator

Show recording state in the StatusLine:

```
┌──────────────────────────────────────────────────────────────┐
│ NORMAL  ~/about.md  recording @a        [markdown] utf-8 1:1 │
└──────────────────────────────────────────────────────────────┘
                      ↑ Red, pulsing
```

Or as a floating indicator:

```
┌───────────────┐
│ recording @a  │  ← Top-right corner, semi-transparent, red/pulsing
└───────────────┘
```

### Registers Overlay (`:reg`)

```
┌─────────────────────────────────────────┐
│              Registers                  │
├─────────────────────────────────────────┤
│  a  j j Enter j j Enter                 │
│  p  / proj Enter                        │
│  t  : theme ghostty Enter               │
│                                         │
│  (3 registers, 23 more available)       │
├─────────────────────────────────────────┤
│ @{letter} replay   Esc close            │
└─────────────────────────────────────────┘
```

### What Gets Recorded

**Record:**
- Navigation keys: `j`, `k`, `Enter`, `-`, `gx`
- Mode keys: `:`, `/`, `?`
- Command input (as a complete command)
- Search input (as a complete search)
- Mark operations: `m{a-z}`, `'{a-z}`
- Scroll: `Ctrl+d`, `Ctrl+u`
- Count prefixes: `5j`, `10k`

**Don't Record:**
- Escape (mode cancel)
- Macro keys themselves (`q`, `@`)
- Help toggle (`?`) - debatable
- Window management (`Ctrl+a` sequences)

### Macro Limits

- **Max length**: 100 keystrokes per macro
- **Max replay depth**: 10 (prevent infinite `@a` containing `@a`)
- **Timeout during replay**: 50ms between keystrokes (for visual feedback)

## Implementation

### Files to Create

1. **`src/context/MacroContext.tsx`**
   - Macro state management
   - Recording/playback logic
   - localStorage persistence

2. **`src/components/ui/RegistersOverlay.tsx`**
   - `:reg` command overlay

3. **`src/components/ui/RecordingIndicator.tsx`**
   - Visual indicator during recording

### Files to Modify

1. **`src/context/NavigationContext.tsx`**
   - Add `q` and `@` pending operators
   - Add `:reg`, `:registers`, `:delreg` commands
   - Wire up macro context

2. **`src/components/terminal/StatusLine.tsx`**
   - Show recording indicator

3. **`src/routes/__root.tsx`**
   - Add MacroProvider
   - Render RecordingIndicator and RegistersOverlay

4. **`src/components/ui/HelpOverlay.tsx`**
   - Add Macros section

### Data Structures

```typescript
// src/context/MacroContext.tsx

interface RecordedKey {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  // For commands/searches, store the complete input
  commandInput?: string;
  searchInput?: string;
}

interface Macro {
  keys: RecordedKey[];
  recordedAt: string;  // ISO date
}

type MacroRegister = string; // a-z

interface MacroContextValue {
  // State
  macros: Record<MacroRegister, Macro>;
  isRecording: boolean;
  recordingRegister: MacroRegister | null;
  isReplaying: boolean;
  lastExecutedRegister: MacroRegister | null;
  
  // Actions
  startRecording: (register: MacroRegister) => void;
  stopRecording: () => void;
  recordKey: (event: KeyboardEvent) => void;
  replayMacro: (register: MacroRegister) => Promise<void>;
  replayLastMacro: () => Promise<void>;
  deleteMacro: (register: MacroRegister) => void;
  deleteAllMacros: () => void;
  
  // Derived
  getDisplayKeys: (register: MacroRegister) => string;
}

const MACROS_STORAGE_KEY = "hobbescodes-macros";
const MAX_MACRO_LENGTH = 100;
const MAX_REPLAY_DEPTH = 10;
const REPLAY_DELAY_MS = 50;
```

### Recording Logic

```typescript
// In MacroContext

const startRecording = useCallback((register: MacroRegister) => {
  if (!/^[a-z]$/.test(register)) return;
  
  setIsRecording(true);
  setRecordingRegister(register);
  setCurrentRecording([]);
}, []);

const stopRecording = useCallback(() => {
  if (!isRecording || !recordingRegister) return;
  
  // Save the macro
  setMacros(prev => {
    const updated = {
      ...prev,
      [recordingRegister]: {
        keys: currentRecording,
        recordedAt: new Date().toISOString(),
      },
    };
    saveMacros(updated);
    return updated;
  });
  
  setIsRecording(false);
  setRecordingRegister(null);
  setCurrentRecording([]);
}, [isRecording, recordingRegister, currentRecording]);

const recordKey = useCallback((event: KeyboardEvent) => {
  if (!isRecording) return;
  if (currentRecording.length >= MAX_MACRO_LENGTH) {
    // Auto-stop if max length reached
    stopRecording();
    return;
  }
  
  // Don't record macro keys themselves
  if (event.key === 'q' || event.key === '@') return;
  // Don't record Escape
  if (event.key === 'Escape') return;
  
  const recorded: RecordedKey = {
    key: event.key,
    ctrlKey: event.ctrlKey || undefined,
    metaKey: event.metaKey || undefined,
    altKey: event.altKey || undefined,
    shiftKey: event.shiftKey || undefined,
  };
  
  setCurrentRecording(prev => [...prev, recorded]);
}, [isRecording, currentRecording.length, stopRecording]);
```

### Playback Logic

```typescript
// In MacroContext

let replayDepth = 0;

const replayMacro = useCallback(async (register: MacroRegister) => {
  const macro = macros[register];
  if (!macro || macro.keys.length === 0) return;
  
  // Prevent infinite recursion
  if (replayDepth >= MAX_REPLAY_DEPTH) {
    console.warn("Max macro replay depth reached");
    return;
  }
  
  replayDepth++;
  setIsReplaying(true);
  setLastExecutedRegister(register);
  
  try {
    for (const recorded of macro.keys) {
      // Dispatch synthetic keyboard event
      const event = new KeyboardEvent('keydown', {
        key: recorded.key,
        ctrlKey: recorded.ctrlKey ?? false,
        metaKey: recorded.metaKey ?? false,
        altKey: recorded.altKey ?? false,
        shiftKey: recorded.shiftKey ?? false,
        bubbles: true,
      });
      
      window.dispatchEvent(event);
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, REPLAY_DELAY_MS));
    }
  } finally {
    replayDepth--;
    if (replayDepth === 0) {
      setIsReplaying(false);
    }
  }
}, [macros]);

const replayLastMacro = useCallback(async () => {
  if (!lastExecutedRegister) return;
  await replayMacro(lastExecutedRegister);
}, [lastExecutedRegister, replayMacro]);
```

### Keyboard Handler Updates

```typescript
// In NavigationContext, NORMAL mode

// Handle 'q' for macro recording
if (pendingOperator === 'q') {
  e.preventDefault();
  clearPendingTimeout();
  
  if (isRecording) {
    // 'q' while recording stops recording
    stopRecording();
  } else if (/^[a-z]$/.test(e.key)) {
    // Start recording to this register
    startRecording(e.key);
  }
  
  setPendingOperator(null);
  return;
}

// Handle '@' for macro replay
if (pendingOperator === '@') {
  e.preventDefault();
  clearPendingTimeout();
  
  if (e.key === '@') {
    // @@ - replay last macro
    replayLastMacro();
  } else if (/^[a-z]$/.test(e.key)) {
    // @{a-z} - replay specific macro
    replayMacro(e.key);
  }
  
  setPendingOperator(null);
  return;
}

// Set pending operators
if (e.key === 'q') {
  if (isRecording) {
    // Stop recording immediately
    stopRecording();
  } else {
    setPendingOperator('q');
    startPendingTimeout();
  }
  return;
}

if (e.key === '@') {
  setPendingOperator('@');
  startPendingTimeout();
  return;
}
```

### Recording Commands and Searches

Special handling for command and search modes to record the complete input:

```typescript
// When entering command mode while recording
if (mode === "COMMAND" && isRecording) {
  // Don't record individual keystrokes in command mode
  // Instead, record the complete command when executed
}

// When command is executed
const executeCommand = useCallback(() => {
  // ... existing logic ...
  
  // If recording, save the complete command
  if (isRecording) {
    recordCommandInput(commandBuffer);
  }
}, [commandBuffer, isRecording]);
```

### Display Keys Function

Convert recorded keys to human-readable format:

```typescript
function getDisplayKeys(register: MacroRegister): string {
  const macro = macros[register];
  if (!macro) return "";
  
  return macro.keys.map(k => {
    let display = "";
    if (k.ctrlKey) display += "C-";
    if (k.metaKey) display += "M-";
    if (k.altKey) display += "A-";
    if (k.shiftKey && k.key.length > 1) display += "S-";
    
    // Human-readable key names
    const keyName = {
      Enter: "⏎",
      Escape: "Esc",
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
      " ": "Space",
    }[k.key] ?? k.key;
    
    return display + keyName;
  }).join(" ");
}
```

### Recording Indicator Component

```tsx
// src/components/ui/RecordingIndicator.tsx

interface RecordingIndicatorProps {
  register: string;
}

export const RecordingIndicator: FC<RecordingIndicatorProps> = ({ register }) => {
  return (
    <div
      className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm animate-pulse"
      style={{
        backgroundColor: "var(--red)",
        color: "var(--crust)",
      }}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      <span>recording @{register}</span>
    </div>
  );
};
```

### StatusLine Integration

```tsx
// In StatusLine.tsx

interface StatusLineProps {
  // ... existing props
  isRecording?: boolean;
  recordingRegister?: string | null;
}

export const StatusLine: FC<StatusLineProps> = ({
  // ... existing
  isRecording,
  recordingRegister,
}) => {
  return (
    <div className="...">
      {/* ... existing content ... */}
      
      {/* Recording indicator */}
      {isRecording && recordingRegister && (
        <span
          className="animate-pulse px-2"
          style={{ color: "var(--red)" }}
        >
          recording @{recordingRegister}
        </span>
      )}
      
      {/* ... rest of status line ... */}
    </div>
  );
};
```

## Which-Key Integration

Add macro registers to Which-Key hints:

```tsx
// When pending operator is 'q'
<WhichKeyHint operator="q">
  <div>Start recording to register</div>
  <div className="grid grid-cols-13 gap-1">
    {/* Show a-z, highlight used registers */}
  </div>
</WhichKeyHint>

// When pending operator is '@'
<WhichKeyHint operator="@">
  <div>Replay macro from register</div>
  <div>
    {Object.keys(macros).map(key => (
      <div key={key}>
        @{key}: {getDisplayKeys(key).slice(0, 30)}...
      </div>
    ))}
  </div>
  {lastExecutedRegister && (
    <div>@@ → replay @{lastExecutedRegister}</div>
  )}
</WhichKeyHint>
```

## Testing Checklist

- [ ] `qa` starts recording to register a
- [ ] Recording indicator appears (status line and/or floating)
- [ ] `q` while recording stops recording
- [ ] Navigate with j/k/Enter while recording - keys are captured
- [ ] `@a` replays the recorded macro
- [ ] `@@` replays the last executed macro
- [ ] Recording commands (`:e about`) works
- [ ] Recording searches (`/proj`) works
- [ ] `:reg` shows all registers with their contents
- [ ] `:delreg a` deletes register a
- [ ] `:delreg!` deletes all registers
- [ ] Macros persist after page refresh
- [ ] Max length (100) stops recording automatically
- [ ] Recursive macros are limited to depth 10
- [ ] Which-Key shows macro hints for `q` and `@`
- [ ] Replaying shows visual feedback (slight delay between keys)

## Edge Cases

- Recording while already recording → stop first recording
- Replaying empty register → no-op
- Replaying during recording → stop recording first? or error?
- Recording Escape → don't record (it cancels)
- Recording `q` → don't record (it's the stop key)
- Very long macros → truncate display in `:reg`

## Example Use Cases

1. **Navigate to projects and back**:
   - `qa` → start recording
   - `:e projects` → navigate
   - `-` → go back
   - `q` → stop
   - `@a` → repeat

2. **Cycle through pages**:
   - `qb` → start recording
   - `j Enter` → next item, open
   - `- j` → back, next
   - `q` → stop
   - `@b` → open next, `@@` → repeat

3. **Quick theme switch**:
   - `qt` → start recording
   - `:theme mocha` → set theme
   - `q` → stop
   - `@t` → instant theme switch

## Future Enhancements

- Edit macros (`:edit-macro a`)
- Name macros (`:macro a "navigate projects"`)
- Export/import macros
- Macro menu with descriptions
- Step-through debugging (`@a` with pauses)
- Record mouse clicks (if mouse support added)

## Dependencies

- NavigationContext (keyboard handling)
- Which-Key (for hints) - Plan 01
- MarksContext patterns (for localStorage)

## Estimated Effort

- **MacroContext**: 2-3 hours
- **Recording logic**: 2 hours
- **Playback logic**: 1-2 hours
- **RegistersOverlay**: 1 hour
- **RecordingIndicator**: 30 minutes
- **NavigationContext updates**: 1 hour
- **Which-Key integration**: 30 minutes
- **Testing & edge cases**: 1-2 hours
- **Total**: ~10-12 hours
