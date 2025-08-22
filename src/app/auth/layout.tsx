import PasswordChangeGuard from '@/components/PasswordChangeGuard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PasswordChangeGuard>
      {children}
    </PasswordChangeGuard>
  )
}