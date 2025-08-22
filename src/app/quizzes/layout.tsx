import PasswordChangeGuard from '@/components/PasswordChangeGuard'

export default function QuizzesLayout({
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