'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export default function CreateStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registration_number: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo de 6 caracteres'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm()) return

    setLoading(true)
    try {
      await apiClient.createStudent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        registration_number: formData.registration_number.trim() || undefined
      })
      router.push('/admin/students')
    } catch (e: any) {
      setSubmitError(e?.message || 'Erro ao criar aluno')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (k: string, v: string) => {
    setFormData(prev => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/students" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Voltar para alunos
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Novo Aluno</h1>
        <p className="text-gray-600 mt-2">Cadastre um aluno na plataforma</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Field label="Nome completo" error={errors.name}>
          <input type="text" value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </Field>

        <Field label="Email" error={errors.email}>
          <input type="email" value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </Field>

        <Field label="Matrícula (opcional)">
          <input type="text" value={formData.registration_number}
            onChange={(e) => updateField('registration_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Senha" error={errors.password}>
            <input type="password" value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </Field>
          <Field label="Confirmar senha" error={errors.confirmPassword}>
            <input type="password" value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/students" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Criar aluno
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
