import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Terminal } from '@/components/terminal'
import { Buffer } from '@/components/editor'
import { useNavigation } from '@/context/NavigationContext'

export const Route = createFileRoute('/resume')({
  component: ResumePage,
})

function ResumePage() {
  const navigate = useNavigate()
  const { mode } = useNavigation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'NORMAL') return
      if (e.key === '-') {
        e.preventDefault()
        navigate({ to: '/', search: { from: '/resume' } })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, mode])

  const content = [
    '# Resume',
    '',
    '## Experience',
    '',
    '### Senior Software Engineer @ TechCorp',
    '    2022 - Present',
    '',
    '    - Led development of core platform features',
    '    - Architected microservices infrastructure',
    '    - Mentored junior developers',
    '',
    '### Software Engineer @ StartupXYZ',
    '    2020 - 2022',
    '',
    '    - Built React applications from scratch',
    '    - Implemented CI/CD pipelines',
    '    - Reduced load times by 60%',
    '',
    '### Junior Developer @ WebAgency',
    '    2018 - 2020',
    '',
    '    - Developed client websites',
    '    - Learned modern web technologies',
    '    - Collaborated with design team',
    '',
    '',
    '## Education',
    '',
    '### B.S. Computer Science',
    '    University of Technology, 2018',
    '',
    '',
    '## Certifications',
    '',
    '  - AWS Solutions Architect',
    '  - Google Cloud Professional',
    '',
    '',
    '## Download',
    '',
    '  PDF version: /resume.pdf (coming soon)',
    '',
  ]

  return (
    <Terminal
      title="👻 ~/hobbescodes/resume.md"
      filepath="~/hobbescodes/resume.md"
      filetype="markdown"
      line={1}
      col={1}
    >
      <Buffer lineCount={content.length + 3} currentLine={1}>
        <div style={{ color: 'var(--text)' }}>
          {content.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith('# ') ? 'var(--red)' :
                  line.startsWith('## ') ? 'var(--peach)' :
                  line.startsWith('### ') ? 'var(--yellow)' :
                  line.startsWith('    2') ? 'var(--overlay1)' :
                  line.startsWith('    - ') ? 'var(--green)' :
                  line.startsWith('  - ') ? 'var(--green)' :
                  undefined,
                fontWeight: line.startsWith('#') ? 'bold' : undefined,
                fontStyle: line.startsWith('    2') ? 'italic' : undefined,
              }}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </Buffer>
    </Terminal>
  )
}
