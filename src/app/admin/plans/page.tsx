'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2, Edit2, Trash2, ToggleLeft, ToggleRight, X,
  CheckCircle2, XCircle, FileQuestion, BookOpen, Video
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Plan {
  id: number
  code: string
  name: string
  price_cents: number
  duration_days: number
  access_questions: boolean
  access_courses: boolean
  access_videos: boolean
  is_active: boolean
  display_order: number
  description: string | null
  savings_label: string | null
}

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Plan | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getPlansAdmin()
      setPlans(res.data || [])
    } catch (e) {
      console.error('Erro ao carregar planos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleToggle = async (p: Plan) => {
    try {
      await apiClient.togglePlan(p.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao alternar plano')
    }
  }

  const handleDelete = async (p: Plan) => {
    if (!window.confirm(`Excluir o plano ${p.name}?`)) return
    try {
      await apiClient.deletePlan(p.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir plano')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Planos</h1>
        <p className="text-gray-600 mt-2">Configure preços e o que cada plano libera</p>
      </header>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">Carregando...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum plano cadastrado</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Plano</th>
                <th className="px-6 py-3 text-left">Preço</th>
                <th className="px-6 py-3 text-left">Duração</th>
                <th className="px-6 py-3 text-left">Acessos</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plans.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.code}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{formatBRL(p.price_cents)}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{p.duration_days} dias</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.access_questions && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          <FileQuestion className="w-3 h-3" /> Questões
                        </span>
                      )}
                      {p.access_courses && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                          <BookOpen className="w-3 h-3" /> Curso
                        </span>
                      )}
                      {p.access_videos && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                          <Video className="w-3 h-3" /> Vídeo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {p.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-yellow-600 hover:text-yellow-800"
                        aria-label={`Editar ${p.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(p)}
                        className="text-gray-600 hover:text-gray-900"
                        aria-label={p.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {p.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <PlanModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load() }}
        />
      )}
    </div>
  )
}

interface ModalProps {
  plan: Plan
  onClose: () => void
  onSaved: () => Promise<void>
}

function PlanModal({ plan, onClose, onSaved }: ModalProps) {
  const [name, setName] = useState(plan.name)
  const [priceBRL, setPriceBRL] = useState((plan.price_cents / 100).toFixed(2))
  const [durationDays, setDurationDays] = useState(String(plan.duration_days))
  const [description, setDescription] = useState(plan.description || '')
  const [savingsLabel, setSavingsLabel] = useState(plan.savings_label || '')
  const [accessQuestions, setAccessQuestions] = useState(plan.access_questions)
  const [accessCourses, setAccessCourses] = useState(plan.access_courses)
  const [accessVideos, setAccessVideos] = useState(plan.access_videos)
  const [isActive, setIsActive] = useState(plan.is_active)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const cents = Math.round(parseFloat(priceBRL.replace(',', '.')) * 100)
    if (!Number.isFinite(cents) || cents <= 0) {
      alert('Preço inválido')
      return
    }
    const days = parseInt(durationDays, 10)
    if (!Number.isFinite(days) || days <= 0) {
      alert('Duração inválida')
      return
    }
    setSaving(true)
    try {
      await apiClient.updatePlan(plan.id, {
        name,
        price_cents: cents,
        duration_days: days,
        description: description || null,
        savings_label: savingsLabel || null,
        access_questions: accessQuestions,
        access_courses: accessCourses,
        access_videos: accessVideos,
        is_active: isActive
      })
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Editar plano <span className="font-mono text-sm">{plan.code}</span></h2>
          <button onClick={onClose} aria-label="Fechar"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome de exibição</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input id="price" type="number" step="0.01" min="0.01" value={priceBRL}
                onChange={(e) => setPriceBRL(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duração (dias)</label>
              <input id="duration" type="number" min="1" value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Acessos liberados</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={accessQuestions}
                  onChange={(e) => setAccessQuestions(e.target.checked)} className="w-4 h-4" />
                <FileQuestion className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Questões e simulados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={accessCourses}
                  onChange={(e) => setAccessCourses(e.target.checked)} className="w-4 h-4" />
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Curso de exercícios</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={accessVideos}
                  onChange={(e) => setAccessVideos(e.target.checked)} className="w-4 h-4" />
                <Video className="w-4 h-4 text-red-600" />
                <span className="text-sm">Aulas em vídeo</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label htmlFor="savings" className="block text-sm font-medium text-gray-700 mb-1">Label de destaque (opcional)</label>
            <input id="savings" type="text" value={savingsLabel}
              onChange={(e) => setSavingsLabel(e.target.value)}
              placeholder="Ex: Mais popular"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium">Plano ativo (visível na página de checkout)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
