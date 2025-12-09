import { type FC, type ReactNode, type CSSProperties } from 'react'

interface BufferLineProps {
  children: ReactNode
  /** Whether this line is currently selected */
  isSelected: boolean
  /** Whether this line contains a link */
  hasLink: boolean
  /** Additional inline styles */
  style?: CSSProperties
}

/**
 * A wrapper component for rendering individual buffer lines with selection state.
 * - Selected line with link: Background highlight (--surface1)
 * - Selected line without link: No background (line number provides visual indicator)
 */
export const BufferLine: FC<BufferLineProps> = ({
  children,
  isSelected,
  hasLink,
  style,
}) => {
  return (
    <div
      style={{
        ...style,
        backgroundColor: isSelected && hasLink ? 'var(--surface1)' : undefined,
        // Extend the highlight to full width for better visual
        marginLeft: isSelected && hasLink ? '-1rem' : undefined,
        marginRight: isSelected && hasLink ? '-1rem' : undefined,
        paddingLeft: isSelected && hasLink ? '1rem' : undefined,
        paddingRight: isSelected && hasLink ? '1rem' : undefined,
      }}
    >
      {children || '\u00A0'}
    </div>
  )
}
