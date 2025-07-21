'use client'

import { ReactNode } from 'react'
import Navbar from './Navbar'
import Breadcrumbs from './Breadcrumbs'

interface AuthLayoutProps {
  children: ReactNode
  isAuthenticated?: boolean
  userName?: string
}

export default function AuthLayout({ children, isAuthenticated = true, userName }: AuthLayoutProps) {
  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} userName={userName} />
      <Breadcrumbs />
      {children}
    </>
  )
}