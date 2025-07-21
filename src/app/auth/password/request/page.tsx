'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function PasswordRequestPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock password reset request
    setSubmitted(true)
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  }

  return (
    <div className="login-container">
      {/* Header */}
      <div className="login-header">
        <div className="container mx-auto px-4 text-center">
          <Image 
            src="/img/logo-epilots.png" 
            alt="Elite Pilots" 
            width={200} 
            height={60}
            priority
          />
        </div>
      </div>

      {/* Reset Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="login-box">
          <h2>Recuperar Senha</h2>
          
          {submitted ? (
            <div className="text-center">
              <div className="alert-success mb-6">
                <strong>E-mail enviado!</strong> Verifique sua caixa de entrada para continuar.
              </div>
              <Link href="/auth/login" className="text-red-600 hover:text-red-700">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6 text-center">
                Digite seu e-mail cadastrado e enviaremos instruções para recuperar sua senha.
              </p>

              <form onSubmit={handleSubmit} className="form-epilots">
                <div className="form-group">
                  <label>E-mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input pl-10"
                      placeholder="seu@email.com"
                      required
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button type="submit" className="btn-epilots btn-epilots-lg w-full">
                  ENVIAR E-MAIL
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-800">
                  ← Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}