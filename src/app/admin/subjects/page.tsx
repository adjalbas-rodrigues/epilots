'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Plus, Edit2, BookOpen, FileQuestion, Loader2, X, ChevronDown, ChevronRight, Trash2
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Topic {
  id: number
  name: string
  subject_id: number
}

interface Subject {
  id: number
  name: string
  short_name?: string
  color?: string
  text_color?: string
  topics?: Topic[]
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Subject | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getAdminSubjects()
      setSubjects(res.data || [])
    } catch (e) {
      console.error('Erro ao carregar matérias:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = subjects.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAddTopic = async (subjectId: number) => {
    const name = window.prompt('Nome do novo tópico:')
    if (!name?.trim()) return
    try {
      await apiClient.createTopic(subjectId, name.trim())
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao criar tópico')
    }
  }

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm('Excluir tópico?')) return
    try {
      await apiClient.deleteTopic(topicId)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir tópico')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Matérias</h1>
          <p className="text-gray-600 mt-2">Gerencie as matérias e seus tópicos</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nova Matéria
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
              <p className="text-sm text-gray-600">Total de matérias</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {subjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total de tópicos</p>
            </div>
            <FileQuestion className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Buscar matéria..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhuma matéria encontrada</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map(s => (
              <div key={s.id}>
                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <button
                    onClick={() => toggleExpand(s.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {expanded.has(s.id)
                      ? <ChevronDown className="w-4 h-4 text-gray-500" />
                      : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: s.color || '#3b82f6' }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      {s.short_name && <p className="text-xs text-gray-500">{s.short_name}</p>}
                    </div>
                    <span className="ml-auto mr-4 text-xs text-gray-500">
                      {s.topics?.length || 0} tópicos
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(s)}
                      className="text-yellow-600 hover:text-yellow-800" aria-label="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAddTopic(s.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded">
                      + Tópico
                    </button>
                  </div>
                </div>

                {expanded.has(s.id) && s.topics && s.topics.length > 0 && (
                  <div className="bg-gray-50 px-12 py-2 space-y-1">
                    {s.topics.map(t => (
                      <div key={t.id} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-gray-700">{t.name}</span>
                        <button onClick={() => handleDeleteTopic(t.id)}
                          className="text-red-500 hover:text-red-700" aria-label="Excluir tópico">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <SubjectModal
          onClose={() => setShowCreate(false)}
          onSaved={async () => { setShowCreate(false); await load() }}
        />
      )}
      {editing && (
        <SubjectModal
          subject={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load() }}
        />
      )}
    </div>
  )
}

interface ModalProps {
  subject?: Subject
  onClose: () => void
  onSaved: () => Promise<void>
}

function SubjectModal({ subject, onClose, onSaved }: ModalProps) {
  const [name, setName] = useState(subject?.name || '')
  const [shortName, setShortName] = useState(subject?.short_name || '')
  const [color, setColor] = useState(subject?.color || '#3b82f6')
  const [textColor, setTextColor] = useState(subject?.text_color || '#ffffff')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return alert('Nome é obrigatório')
    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        short_name: shortName.trim() || undefined,
        color,
        text_color: textColor
      }
      if (subject) {
        await apiClient.updateSubject(subject.id, data)
      } else {
        await apiClient.createSubject(data)
      }
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{subject ? 'Editar matéria' : 'Nova matéria'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome curto (opcional)</label>
            <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor do texto</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
