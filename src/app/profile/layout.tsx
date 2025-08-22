import PasswordChangeGuard from '@/components/PasswordChangeGuard'

export default function ProfileLayout({
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