export default async function EditPage({
  params,
}: {
  params: Promise<{ projectId: string; collection: string; slug: string[] }>
}) {
  const { projectId, collection, slug } = await params
  const filename = slug.join('/') + '.md'

  return (
    <main>
      <p>Editing: {filename}</p>
      <p>Collection: {collection}</p>
      <p>Project: {projectId}</p>
    </main>
  )
}