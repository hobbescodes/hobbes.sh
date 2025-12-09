import { type FC } from 'react'

interface HelpOverlayProps {
  onClose: () => void
}

export const HelpOverlay: FC<HelpOverlayProps> = ({ onClose }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(17, 17, 27, 0.85)' }} // --crust with opacity
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--base)',
          border: '1px solid var(--surface0)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 text-center font-bold"
          style={{
            backgroundColor: 'var(--surface0)',
            color: 'var(--text)',
            borderBottom: '1px solid var(--surface1)',
          }}
        >
          Help
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 text-sm">
            {/* Navigation Column */}
            <div>
              <h3
                className="font-bold mb-3 pb-1"
                style={{
                  color: 'var(--peach)',
                  borderBottom: '1px solid var(--surface1)',
                }}
              >
                Navigation
              </h3>
              <div className="space-y-2">
                <KeyBinding keys="j / ↓" description="Move down" />
                <KeyBinding keys="k / ↑" description="Move up" />
                <KeyBinding keys="Ctrl+d" description="Scroll down" />
                <KeyBinding keys="Ctrl+u" description="Scroll up" />
                <KeyBinding keys="Enter" description="Open" />
                <KeyBinding keys="-" description="Parent" />
              </div>
            </div>

            {/* Modes Column */}
            <div>
              <h3
                className="font-bold mb-3 pb-1"
                style={{
                  color: 'var(--peach)',
                  borderBottom: '1px solid var(--surface1)',
                }}
              >
                Modes
              </h3>
              <div className="space-y-2">
                <KeyBinding keys=":" description="Command" />
                <KeyBinding keys="/" description="Search" />
                <KeyBinding keys="?" description="Help" />
                <KeyBinding keys="Esc" description="Normal" />
              </div>
            </div>

            {/* Commands Column */}
            <div>
              <h3
                className="font-bold mb-3 pb-1"
                style={{
                  color: 'var(--peach)',
                  borderBottom: '1px solid var(--surface1)',
                }}
              >
                Commands
              </h3>
              <div className="space-y-2">
                <KeyBinding keys=":q" description="Go home" />
                <KeyBinding keys=":e <path>" description="Open file" />
                <KeyBinding keys=":help" description="Show help" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 text-center text-xs"
          style={{
            backgroundColor: 'var(--surface0)',
            color: 'var(--overlay1)',
            borderTop: '1px solid var(--surface1)',
          }}
        >
          Press <span style={{ color: 'var(--blue)' }}>?</span> or{' '}
          <span style={{ color: 'var(--blue)' }}>Esc</span> to close
        </div>
      </div>
    </div>
  )
}

// Helper component for key bindings
interface KeyBindingProps {
  keys: string
  description: string
}

const KeyBinding: FC<KeyBindingProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="font-mono text-xs px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: 'var(--surface1)',
          color: 'var(--blue)',
        }}
      >
        {keys}
      </span>
      <span className="whitespace-nowrap" style={{ color: 'var(--subtext0)' }}>{description}</span>
    </div>
  )
}
