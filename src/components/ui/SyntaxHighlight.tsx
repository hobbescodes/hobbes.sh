import { type FC, type ReactNode, useMemo } from 'react'

interface LineProps {
  isSelected: boolean
  hasLink: boolean
  url: string | null
}

interface SyntaxHighlightProps {
  /** Array of content lines to render */
  content: string[]
  /** The filetype for context-specific highlighting */
  filetype?: 'markdown' | 'code' | 'typescript' | 'javascript' | 'rust' | 'lua'
  /** Optional function to get line props for selection highlighting */
  getLineProps?: (lineIndex: number) => LineProps
}

interface LineStyle {
  color?: string
  fontWeight?: 'bold' | 'normal'
  fontStyle?: 'italic' | 'normal'
  backgroundColor?: string
}

/**
 * Callout types with their associated colors (GitHub-style)
 * Maps to Catppuccin palette colors
 */
const CALLOUT_TYPES = {
  NOTE: {
    color: 'var(--blue)',
    bgColor: 'rgba(137, 180, 250, 0.1)', // blue with transparency
    icon: '',
  },
  TIP: {
    color: 'var(--green)',
    bgColor: 'rgba(166, 227, 161, 0.1)', // green with transparency
    icon: '',
  },
  IMPORTANT: {
    color: 'var(--mauve)',
    bgColor: 'rgba(203, 166, 247, 0.1)', // mauve with transparency
    icon: '',
  },
  WARNING: {
    color: 'var(--yellow)',
    bgColor: 'rgba(249, 226, 175, 0.1)', // yellow with transparency
    icon: '',
  },
  CAUTION: {
    color: 'var(--red)',
    bgColor: 'rgba(243, 139, 168, 0.1)', // red with transparency
    icon: '',
  },
} as const

type CalloutType = keyof typeof CALLOUT_TYPES

/**
 * Check if a line is a callout line (starts with ">")
 * Returns the content without the ">" prefix if it is
 */
function parseCalloutLine(line: string): { isCalloutLine: boolean; content: string } {
  if (line.startsWith('> ')) {
    return { isCalloutLine: true, content: line.slice(2) }
  }
  if (line === '>') {
    return { isCalloutLine: true, content: '' }
  }
  return { isCalloutLine: false, content: line }
}

/**
 * Check if a line starts a callout block (e.g., "> [!NOTE]" or "> NOTE:")
 * Supports both GitHub style [!TYPE] and simple TYPE: format
 */
function getCalloutType(content: string): CalloutType | null {
  const trimmed = content.trim()
  for (const type of Object.keys(CALLOUT_TYPES) as CalloutType[]) {
    // GitHub style: [!NOTE], [!WARNING], etc.
    if (trimmed.startsWith(`[!${type}]`)) {
      return type
    }
    // Simple style: NOTE:, WARNING:, etc.
    if (trimmed.startsWith(`${type}:`) || trimmed === type) {
      return type
    }
  }
  return null
}

/**
 * Strip the callout type prefix from content for display
 */
function stripCalloutPrefix(content: string, type: CalloutType): string {
  const trimmed = content.trim()
  // GitHub style: [!NOTE] rest of content
  if (trimmed.startsWith(`[!${type}]`)) {
    return trimmed.slice(`[!${type}]`.length).trim()
  }
  // Simple style: NOTE: rest of content
  if (trimmed.startsWith(`${type}:`)) {
    return trimmed.slice(`${type}:`.length).trim()
  }
  return content
}

/**
 * Highlights and renders content with vim/catppuccin-style syntax highlighting
 */
export const SyntaxHighlight: FC<SyntaxHighlightProps> = ({
  content,
  filetype: _filetype = 'markdown',
  getLineProps,
}) => {
  const renderedLines = useMemo(() => {
    let inCodeBlock = false
    let codeLanguage = ''
    let currentCallout: CalloutType | null = null

    return content.map((line, index) => {
      // Check for code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
          currentCallout = null // End any callout when entering code block
          return {
            key: index,
            content: line,
            style: { color: 'var(--overlay1)' } as LineStyle,
            isCodeBlockDelimiter: true,
          }
        } else {
          inCodeBlock = false
          codeLanguage = ''
          return {
            key: index,
            content: line,
            style: { color: 'var(--overlay1)' } as LineStyle,
            isCodeBlockDelimiter: true,
          }
        }
      }

      // Inside code block - apply code highlighting
      if (inCodeBlock) {
        return {
          key: index,
          content: line,
          style: getCodeLineStyle(line, codeLanguage),
          isCodeBlock: true,
          language: codeLanguage,
        }
      }

      // Check for callout lines (must start with ">")
      const { isCalloutLine, content: lineContent } = parseCalloutLine(line)
      
      if (isCalloutLine) {
        // Check if this line starts a new callout block
        const calloutType = getCalloutType(lineContent)
        if (calloutType) {
          currentCallout = calloutType
          const calloutConfig = CALLOUT_TYPES[calloutType]
          const displayContent = stripCalloutPrefix(lineContent, calloutType)
          return {
            key: index,
            content: displayContent,
            style: { 
              color: calloutConfig.color, 
              fontWeight: 'bold' as const,
              backgroundColor: calloutConfig.bgColor,
            },
            isCallout: true,
            calloutType: calloutType,
            isCalloutStart: true,
          }
        }
        
        // Continue existing callout block
        if (currentCallout) {
          const calloutConfig = CALLOUT_TYPES[currentCallout]
          return {
            key: index,
            content: lineContent,
            style: { 
              color: calloutConfig.color,
              backgroundColor: calloutConfig.bgColor,
            },
            isCallout: true,
            calloutType: currentCallout,
            isCalloutStart: false,
          }
        }
        
        // Regular blockquote (no active callout type)
        return {
          key: index,
          content: lineContent,
          style: { color: 'var(--overlay1)', fontStyle: 'italic' as const },
          isCodeBlock: false,
        }
      }
      
      // Non-callout line ends any active callout
      currentCallout = null

      // Regular markdown content
      return {
        key: index,
        content: line,
        style: getMarkdownLineStyle(line),
        isCodeBlock: false,
      }
    })
  }, [content])

  return (
    <div style={{ color: 'var(--text)' }}>
      {renderedLines.map((line) => {
        const lineProps = getLineProps?.(line.key)
        const isSelectedWithLink = lineProps?.isSelected && lineProps?.hasLink

        // Callout styling
        if (line.isCallout && line.calloutType) {
          const calloutType = line.calloutType as CalloutType
          const calloutConfig = CALLOUT_TYPES[calloutType]
          return (
            <div
              key={line.key}
              style={{
                ...line.style,
                borderLeft: `3px solid ${calloutConfig.color}`,
                paddingLeft: '0.5rem',
                marginLeft: '-0.625rem',
              }}
            >
              {line.isCalloutStart ? (
                <>
                  {calloutConfig.icon && <span style={{ marginRight: '0.5rem' }}>{calloutConfig.icon}</span>}
                  <span style={{ fontWeight: 'bold' }}>{calloutType}</span>
                  {line.content && (
                    <>
                      <span style={{ fontWeight: 'normal' }}>: </span>
                      <span style={{ fontWeight: 'normal' }}>{line.content}</span>
                    </>
                  )}
                </>
              ) : (
                line.content || '\u00A0'
              )}
            </div>
          )
        }

        return (
          <div
            key={line.key}
            style={{
              ...line.style,
              backgroundColor: isSelectedWithLink
                ? 'var(--surface1)'
                : line.isCodeBlock
                  ? 'var(--surface0)'
                  : line.style.backgroundColor,
              paddingLeft: line.isCodeBlock ? '1rem' : isSelectedWithLink ? '1rem' : undefined,
              paddingRight: line.isCodeBlock ? '1rem' : isSelectedWithLink ? '1rem' : undefined,
              marginLeft: line.isCodeBlock ? '-0.5rem' : isSelectedWithLink ? '-1rem' : undefined,
              marginRight: line.isCodeBlock ? '-0.5rem' : isSelectedWithLink ? '-1rem' : undefined,
              borderRadius: line.isCodeBlockDelimiter ? '0.25rem' : undefined,
            }}
          >
            {line.isCodeBlock && !line.isCodeBlockDelimiter ? (
              <CodeLine content={line.content} language={line.language || ''} />
            ) : (
              line.content || '\u00A0'
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Get styling for a markdown line
 */
function getMarkdownLineStyle(line: string): LineStyle {
  // Headers
  if (line.startsWith('# ')) {
    return { color: 'var(--red)', fontWeight: 'bold' }
  }
  if (line.startsWith('## ')) {
    return { color: 'var(--peach)', fontWeight: 'bold' }
  }
  if (line.startsWith('### ')) {
    return { color: 'var(--yellow)', fontWeight: 'bold' }
  }
  if (line.startsWith('#### ')) {
    return { color: 'var(--green)', fontWeight: 'bold' }
  }

  // Horizontal rule
  if (line === '---' || line === '***' || line === '___') {
    return { color: 'var(--surface2)' }
  }

  // List items
  if (line.match(/^\s*[-*+]\s/)) {
    return { color: 'var(--green)' }
  }

  // Numbered list
  if (line.match(/^\s*\d+\.\s/)) {
    return { color: 'var(--teal)' }
  }

  // Blockquotes
  if (line.startsWith('>')) {
    return { color: 'var(--overlay1)', fontStyle: 'italic' }
  }

  // Indented content (often metadata or descriptions)
  if (line.startsWith('  ') && !line.startsWith('    ')) {
    return { color: 'var(--subtext0)' }
  }

  // Links - simple detection
  if (line.includes('http://') || line.includes('https://')) {
    return { color: 'var(--blue)' }
  }

  return {}
}

/**
 * Get styling for a line inside a code block
 */
function getCodeLineStyle(_line: string, _language: string): LineStyle {
  // For code blocks, we use a base style and let CodeLine handle token-level highlighting
  return { color: 'var(--text)' }
}

/**
 * Renders a single line of code with token-level highlighting
 */
interface CodeLineProps {
  content: string
  language: string
}

const CodeLine: FC<CodeLineProps> = ({ content, language }) => {
  const tokens = useMemo(() => tokenizeLine(content, language), [content, language])

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: token.color }}>
          {token.text}
        </span>
      ))}
      {content === '' && '\u00A0'}
    </>
  )
}

interface Token {
  text: string
  color?: string
}

/**
 * Simple tokenizer for code highlighting
 * This is a basic implementation - for production, consider using a library like Shiki
 */
function tokenizeLine(line: string, language: string): Token[] {
  if (!line) return [{ text: '' }]

  const tokens: Token[] = []
  let remaining = line

  // Language-specific keywords
  const keywords: Record<string, string[]> = {
    typescript: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'default', 'type', 'interface', 'class', 'extends',
      'implements', 'new', 'this', 'async', 'await', 'try', 'catch', 'throw',
      'typeof', 'instanceof', 'true', 'false', 'null', 'undefined',
    ],
    javascript: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this',
      'async', 'await', 'try', 'catch', 'throw', 'typeof', 'instanceof',
      'true', 'false', 'null', 'undefined',
    ],
    rust: [
      'fn', 'let', 'mut', 'const', 'pub', 'mod', 'use', 'struct', 'enum', 'impl',
      'trait', 'where', 'for', 'loop', 'while', 'if', 'else', 'match', 'return',
      'self', 'Self', 'true', 'false', 'async', 'await', 'move', 'ref', 'type',
    ],
    lua: [
      'local', 'function', 'end', 'if', 'then', 'else', 'elseif', 'for', 'do',
      'while', 'repeat', 'until', 'return', 'break', 'and', 'or', 'not', 'in',
      'true', 'false', 'nil', 'require',
    ],
  }

  const langKeywords = keywords[language] || keywords.typescript || []

  // Simple tokenization loop
  while (remaining.length > 0) {
    // Skip whitespace
    const wsMatch = remaining.match(/^(\s+)/)
    if (wsMatch) {
      tokens.push({ text: wsMatch[1] })
      remaining = remaining.slice(wsMatch[1].length)
      continue
    }

    // Comments (// and --)
    if (remaining.startsWith('//') || remaining.startsWith('--')) {
      tokens.push({ text: remaining, color: 'var(--overlay2)' })
      break
    }

    // Strings (single and double quotes)
    const stringMatch = remaining.match(/^(['"`])(?:[^\\]|\\.)*?\1/)
    if (stringMatch) {
      tokens.push({ text: stringMatch[0], color: 'var(--green)' })
      remaining = remaining.slice(stringMatch[0].length)
      continue
    }

    // Numbers
    const numMatch = remaining.match(/^-?\d+\.?\d*/)
    if (numMatch) {
      tokens.push({ text: numMatch[0], color: 'var(--peach)' })
      remaining = remaining.slice(numMatch[0].length)
      continue
    }

    // Keywords and identifiers
    const wordMatch = remaining.match(/^[a-zA-Z_]\w*/)
    if (wordMatch) {
      const word = wordMatch[0]
      if (langKeywords.includes(word)) {
        tokens.push({ text: word, color: 'var(--mauve)' })
      } else if (word[0] === word[0].toUpperCase() && word.length > 1) {
        // Likely a type/class
        tokens.push({ text: word, color: 'var(--yellow)' })
      } else {
        tokens.push({ text: word, color: 'var(--text)' })
      }
      remaining = remaining.slice(word.length)
      continue
    }

    // Operators and punctuation
    const opMatch = remaining.match(/^[+\-*/%=<>!&|^~?:;.,()[\]{}@#$]+/)
    if (opMatch) {
      tokens.push({ text: opMatch[0], color: 'var(--sky)' })
      remaining = remaining.slice(opMatch[0].length)
      continue
    }

    // Fallback - single character
    tokens.push({ text: remaining[0] })
    remaining = remaining.slice(1)
  }

  return tokens
}

/**
 * Inline code renderer - for `code` within text
 */
export const InlineCode: FC<{ children: ReactNode }> = ({ children }) => (
  <span
    className="px-1 py-0.5 rounded font-mono text-sm"
    style={{
      backgroundColor: 'var(--surface0)',
      color: 'var(--pink)',
    }}
  >
    {children}
  </span>
)
