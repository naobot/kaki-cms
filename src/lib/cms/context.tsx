import { createContext, useContext } from 'react'

type RepoContextValue = {
  repoId: string
  githubRepo: string
}

const RepoContext = createContext<RepoContextValue | null>(null)

export const RepoProvider = RepoContext.Provider

export function useRepo(): RepoContextValue {
  const ctx = useContext(RepoContext)
  if (!ctx) throw new Error('useRepo must be used within a RepoProvider')
  return ctx
}
