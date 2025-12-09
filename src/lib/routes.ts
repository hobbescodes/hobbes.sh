import type { RouteEntry } from '@/types'

export const routeTree: RouteEntry = {
  name: 'hobbescodes',
  displayName: '~/',
  type: 'directory',
  path: '/',
  children: [
    { name: 'about', displayName: 'about.md', type: 'file', path: '/about' },
    { name: 'contact', displayName: 'contact.md', type: 'file', path: '/contact' },
    { name: 'resume', displayName: 'resume.md', type: 'file', path: '/resume' },
    {
      name: 'projects',
      displayName: 'projects/',
      type: 'directory',
      path: '/projects',
      children: [], // Populated dynamically
    },
    {
      name: 'blog',
      displayName: 'blog/',
      type: 'directory',
      path: '/blog',
      children: [], // Populated dynamically
    },
  ],
}

/**
 * Get route entries for a given path
 */
export function getEntriesForPath(path: string): RouteEntry[] {
  if (path === '/') {
    return routeTree.children || []
  }

  // Find the matching route
  const segments = path.split('/').filter(Boolean)
  let current: RouteEntry | undefined = routeTree

  for (const segment of segments) {
    current = current?.children?.find((child) => child.name === segment)
    if (!current) break
  }

  return current?.children || []
}

/**
 * Get parent path
 */
export function getParentPath(path: string): string {
  if (path === '/') return '/'
  const segments = path.split('/').filter(Boolean)
  segments.pop()
  return segments.length === 0 ? '/' : `/${segments.join('/')}`
}

/**
 * Convert route path to display title
 */
export function pathToTitle(path: string): string {
  if (path === '/') return '~/hobbescodes/'
  
  // Determine if it's a directory or file based on path
  const isDirectory = path.endsWith('/') || 
    routeTree.children?.some(
      child => child.path === path && child.type === 'directory'
    )
  
  const suffix = isDirectory ? '/' : '.md'
  return `~/hobbescodes${path}${isDirectory ? '' : suffix}`
}

/**
 * Convert route path to filepath for status line
 */
export function pathToFilepath(path: string): string {
  if (path === '/') return '~/hobbescodes/'
  return `~/hobbescodes${path}`
}
