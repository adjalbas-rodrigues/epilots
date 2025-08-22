import PasswordChangeGuard from '@/components/PasswordChangeGuard'

export default function StatisticsLayout({
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