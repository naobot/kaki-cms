'use client'

import { createContext, useContext } from 'react'
import type { CMSConfig } from './types'

export type RepoRow = {
  id: string
  owner_id: string
  display_name: string
  github_repo: string
  config_path: string
  created_at: string
}

export type RepoContextValue = {
  repo: RepoRow
  config: CMSConfig
  accessToken: string
  userType: 'developer' | 'editor'
}

const RepoContext = createContext<RepoContextValue | null>(null)

export const RepoProvider = RepoContext.Provider

export function useRepo(): RepoContextValue {
  const ctx = useContext(RepoContext)
  if (!ctx) throw new Error('useRepo must be used within a RepoProvider')
  return ctx
}