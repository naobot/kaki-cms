'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewRepoPage() {
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
    await fetch('/api/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.push('/dashboard')
  }

  return (
    <div className="p-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Client Repo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" name="display_name" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="github_repo">GitHub repo</Label>
              <Input
                id="github_repo"
                name="github_repo"
                placeholder="nao/alice-portfolio"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="config_path">Config path</Label>
              <Input
                id="config_path"
                name="config_path"
                placeholder="cms.config.json"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Add repo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}