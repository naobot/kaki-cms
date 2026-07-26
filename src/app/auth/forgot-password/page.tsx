import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Kaki CMS</CardTitle>
            <CardDescription>Reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
