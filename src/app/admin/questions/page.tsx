'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Loader2, FileQuestion, Trash2, Eye, X
} from 'lucide-react'
import apiClient from '@/lib/api'
import { rewriteHtmlForRender } from '@/lib/htmlAssets'

interface Choice {
  id: number
  description: string
  is_correct: boolean
  label: string
}

interface Question {
  id: number
  statement: string
  choices: Choice[]
  topics: Array<{
    id: number
    name: string
    subject?: { id: number; name: string; color?: string }
  }>
  created_at: string
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [subjects, setSubjects] = useState<any[]>([])
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [viewing, setViewing] = useState<Question | null>(null)

  useEffect(() => {
    apiClient.getAdminSubjects()
      .then((res: any) => setSubjects(res.data || []))
      .catch(console.error)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const subjectId = subjectFilter !== 'all' ? Number(subjectFilter) : undefined
      const res: any = await apiClient.getQuestions(page, 20, subjectId, search || undefined)
      setQuestions(res.data?.questions || [])
      setTotalPages(res.data?.totalPages || 1)
    } catch (e) {
      console.error('Erro ao carregar questões:', e)
    } finally {
      setLoading(false)
    }
  }, [page, search, subjectFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (q: Question) => {
    if (!window.confirm('Excluir esta questão?')) return
    try {
      await apiClient.deleteQuestion(q.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir questão')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Questões</h1>
        <p className="text-gray-600 mt-2">Banco de questões do sistema</p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar por enunciado..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1) }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">Todas as matérias</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Nenhuma questão encontrada
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Enunciado</th>
                <th className="px-6 py-3 text-left">Matéria(s)</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{q.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xl truncate">
                    <div>{(q.statement || '').replace(/<[^>]+>/g, '').slice(0, 200)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(q.topics?.map(t => t.subject?.name).filter(Boolean))).map((name, i) => (
                        <span key={i} className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewing(q)} className="text-blue-600 hover:text-blue-800" aria-label="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q)} className="text-red-600 hover:text-red-800" aria-label="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Anterior</button>
            <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Próximo</button>
          </div>
        )}
      </div>

      {viewing && <ViewModal question={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

function ViewModal({ question, onClose }: { question: Question; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Questão #{question.id}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: rewriteHtmlForRender(question.statement || '') }} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Alternativas:</p>
            {question.choices?.map(c => (
              <div key={c.id}
                className={`p-3 rounded-lg border ${
                  c.is_correct
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                <span className="font-bold mr-2">{c.label})</span>
                <span dangerouslySetInnerHTML={{ __html: rewriteHtmlForRender(c.description || '') }} />
                {c.is_correct && <span className="ml-2 text-xs text-green-700 font-semibold">✓ Correta</span>}
              </div>
            ))}
          </div>
          {question.topics && question.topics.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Tópicos:</p>
              <div className="flex flex-wrap gap-1">
                {question.topics.map(t => (
                  <span key={t.id} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
