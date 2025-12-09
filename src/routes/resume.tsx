import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from '@/components/terminal'
import { Buffer, BufferLine } from '@/components/editor'
import { useBufferNavigation } from '@/hooks/useBufferNavigation'

export const Route = createFileRoute('/resume')({
  component: ResumePage,
})

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

function ResumePage() {
  const navigate = useNavigate()

  const { currentLine, getLineProps } = useBufferNavigation({
    content,
    onNavigateBack: () => navigate({ to: '/', search: { from: '/resume' } }),
  })

  return (
    <Terminal
      title="👻 ~/hobbescodes/resume.md"
      filepath="~/hobbescodes/resume.md"
      filetype="markdown"
      line={currentLine}
      col={1}
    >
      <Buffer lineCount={content.length + 3} currentLine={currentLine}>
        <div style={{ color: 'var(--text)' }}>
          {content.map((line, i) => {
            const { isSelected, hasLink } = getLineProps(i)
            return (
              <BufferLine key={i} isSelected={isSelected} hasLink={hasLink}>
                <span
                  style={{
                    color: line.startsWith('# ')
                      ? 'var(--red)'
                      : line.startsWith('## ')
                        ? 'var(--peach)'
                        : line.startsWith('### ')
                          ? 'var(--yellow)'
                          : line.startsWith('    2')
                            ? 'var(--overlay1)'
                            : line.startsWith('    - ')
                              ? 'var(--green)'
                              : line.startsWith('  - ')
                                ? 'var(--green)'
                                : undefined,
                    fontWeight: line.startsWith('#') ? 'bold' : undefined,
                    fontStyle: line.startsWith('    2') ? 'italic' : undefined,
                  }}
                >
                  {line || '\u00A0'}
                </span>
              </BufferLine>
            )
          })}
        </div>
      </Buffer>
    </Terminal>
  )
}
