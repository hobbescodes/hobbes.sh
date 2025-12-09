import { type FC } from 'react'

interface TitleBarProps {
  title: string
}

export const TitleBar: FC<TitleBarProps> = ({ title }) => {
  return (
    <div className="flex items-center h-8 px-3 bg-[var(--mantle)] border-b border-[var(--surface0)] select-none">
      {/* Traffic light buttons (decorative) */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--red)' }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--yellow)' }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--green)' }} />
      </div>

      {/* Window title */}
      <div className="flex-1 text-center text-[var(--subtext0)] text-sm truncate">
        {title}
      </div>

      {/* Spacer for symmetry */}
      <div className="w-14" />
    </div>
  )
}
