import { createClient } from '@/lib/supabase/server'
import { fetchConfig } from '@/lib/cms/config'
import { getFile } from '@/lib/github/api'
import { redirect } from 'next/navigation'
import * as yaml from 'js-yaml'
import SettingsEditor from '@/components/SettingsEditor'
import { getUserType } from '@/lib/cms/user'

function parseDataFile(content: string, filePath: string): string[] | null {
  try {
    const ext = filePath.split('.').pop()?.toLowerCase()
    const parsed = ext === 'json' ? JSON.parse(content) : yaml.load(content)
    if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) return null
    return parsed
  } catch {
    return null
  }
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ repoId: string }>
}) {
  const { repoId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: repo } = await supabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

  if (!repo) redirect('/dashboard')

  const { data: tokenRow } = await supabase
    .from('github_tokens')
    .select('access_token')
    .single()

  const [config, userType] = await Promise.all([
    fetchConfig(tokenRow!.access_token, repo.github_repo, repo.config_path),
    getUserType(),
  ])

  if (!config.data_files || config.data_files.length === 0) {
    redirect(`/dashboard/${repoId}`)
  }

  const dataFiles = await Promise.all(
    config.data_files.map(async dataFile => {
      const file = await getFile(tokenRow!.access_token, repo.github_repo, dataFile.path)
      const items = file ? parseDataFile(file.content, dataFile.path) : []
      return {
        path: dataFile.path,
        label: dataFile.label,
        items: items ?? [],
        sha: file?.sha ?? null,
      }
    })
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Site data</h1>
      </div>
      <SettingsEditor repoId={repoId} dataFiles={dataFiles} userType={userType} />
    </div>
  )
}