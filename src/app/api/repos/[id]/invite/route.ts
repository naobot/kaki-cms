import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  // Verify the requester is authenticated and owns this repo
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: repo } = await supabase
    .from('repos')
    .select()
    .eq('id', repoId)
    .single()

  if (!repo || repo.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Create or retrieve the user via admin client
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?repo_id=${repoId}`,
    }
  )
  // Get the user id — either from the invite or look them up
  let editorUserId = inviteData?.user?.id

  if (inviteError) {
    if (inviteError.message === 'A user with this email address has already been registered') {
      const { data: { users } } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })
      const existing = users.find(u => u.email === email)
      editorUserId = existing?.id
    } else {
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }
  }

  if (!editorUserId) {
    const { data: existingUser } = await admin
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()

    editorUserId = existingUser?.id
  }

  if (!editorUserId) {
    return NextResponse.json({ error: 'Could not resolve user' }, { status: 500 })
  }

  // Record the invitation
  await supabase.from('invitations').upsert({
    email,
    repo_id: repoId,
    invited_by: user.id,
  })

  // Add as project member
  await supabase.from('project_members').upsert({
    project_id: repoId,
    user_id: editorUserId,
  })

  return NextResponse.json({ success: true })
}