import PasswordChangeGuard from '@/components/PasswordChangeGuard'

export default function LessonsLayout({
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