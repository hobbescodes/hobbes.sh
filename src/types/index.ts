// Navigation types
export interface RouteEntry {
  name: string
  displayName: string
  type: 'directory' | 'file'
  path: string
  children?: RouteEntry[]
}

// Navigation state
export interface NavigationState {
  currentPath: string
  selectedIndex: number
  mode: 'NORMAL' | 'COMMAND' | 'SEARCH'
  commandBuffer: string
  searchQuery: string
}

// Project types (GitHub API compatible)
export interface Project {
  name: string
  description: string
  url: string
  homepage?: string
  language?: string
  stars: number
  forks: number
  topics: string[]
  updatedAt: string
  featured?: boolean
  order?: number
}

// Content types
export interface ContentSection {
  heading?: string
  content: string
}

export interface AboutContent {
  title: string
  sections: ContentSection[]
}

export interface ContactContent {
  email: string
  github: string
  twitter?: string
  linkedin?: string
  bluesky?: string
}
