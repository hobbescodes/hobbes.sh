import { type FC } from 'react'

interface NavigationHintProps {
  showNavigate?: boolean
  showOpen?: boolean
  showParent?: boolean
  showJump?: boolean
}

export const NavigationHint: FC<NavigationHintProps> = ({
  showNavigate = false,
  showOpen = false,
  showParent = true,
  showJump = false,
}) => {
  return (
    <div className="mt-4 text-xs" style={{ color: 'var(--overlay0)' }}>
      {showNavigate && (
        <>
          <span style={{ color: 'var(--overlay1)' }}>j/k</span> navigate{' '}
        </>
      )}
      {showOpen && (
        <>
          <span style={{ color: 'var(--overlay1)' }}>Enter</span> open{' '}
        </>
      )}
      {showParent && (
        <>
          <span style={{ color: 'var(--overlay1)' }}>-</span> go back{' '}
        </>
      )}
      {showJump && (
        <>
          <span style={{ color: 'var(--overlay1)' }}>g/G</span> first/last
        </>
      )}
    </div>
  )
}
