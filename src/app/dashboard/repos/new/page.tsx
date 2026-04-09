'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const body = {
      display_name: form.display_name.value,
      github_repo: form.github_repo.value,
      config_path: form.config_path.value || 'cms.config.json',
    }
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.push('/dashboard')
  }

  return (
    <main>
      <h1>Add Client Repo</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Display name
          <input name="display_name" required />
        </label>
        <label>
          GitHub repo (owner/repo)
          <input name="github_repo" placeholder="nao/alice-portfolio" required />
        </label>
        <label>
          Config path
          <input name="config_path" placeholder="cms.config.json" />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add project'}
        </button>
      </form>
    </main>
  )
}