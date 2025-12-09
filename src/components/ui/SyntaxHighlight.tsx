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

    return content.map((line, index) => {
      // Check for code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
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
