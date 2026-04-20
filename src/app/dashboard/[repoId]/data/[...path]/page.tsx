import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchConfig } from '@/lib/cms/config'
import { getFile } from '@/lib/github/api'
import { redirect } from 'next/navigation'
import { getUserType } from '@/lib/cms/user'
import * as yaml from 'js-yaml'
import SettingsEditor from '@/components/SettingsEditor'
import DataFileEditor from '@/components/DataFileEditor'

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

export default async function DataFilePage({
  params,
}: {
  params: Promise<{ repoId: string; path: string[] }>
}) {
  const { repoId, path } = await params
  const filePath = path.join('/')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceSupabase = createServiceClient()

  const { data: repo } = await serviceSupabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()
  if (!repo) redirect('/dashboard')

  const { data: tokenRow } = await serviceSupabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', repo.owner_id)
    .single()
  if (!tokenRow) redirect('/dashboard')

  const [config, userType] = await Promise.all([
    fetchConfig(tokenRow.access_token, repo.github_repo, repo.config_path),
    getUserType(),
  ])

  const dataFileConfig = config.data_files?.find(f => f.path === filePath)
  if (!dataFileConfig) redirect(`/dashboard/${repoId}`)

  const file = await getFile(tokenRow.access_token, repo.github_repo, filePath)

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Site Data</h1>
      </div>

      {dataFileConfig.fields && dataFileConfig.fields.length > 0 ? (
        <DataFileEditor
          repoId={repoId}
          filePath={filePath}
          fields={dataFileConfig.fields}
          file={file ?? null}
          userType={userType}
        />
      ) : (
        <SettingsEditor
          repoId={repoId}
          userType={userType}
          dataFiles={[{
            path: filePath,
            label: dataFileConfig.label,
            items: file ? (parseDataFile(file.content, filePath) ?? []) : [],
            sha: file?.sha ?? null,
          }]}
        />
      )}
    </div>
  )
}