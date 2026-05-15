'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  FileDown,
  Download,
  X,
  AlertCircle,
  Upload,
} from 'lucide-react'
import apiClient from '@/lib/api'

interface Material {
  id: number
  title: string
  description?: string
  file_name: string
  file_size: number
  is_active: boolean
  download_count: number
  created_at: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await apiClient.getAdminMaterials()
      setMaterials(res.data?.materials || [])
    } catch (e) {
      console.error('Erro ao carregar materiais:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleNew = () => { setEditing(null); setShowModal(true) }
  const handleEdit = (m: Material) => { setEditing(m); setShowModal(true) }
  const handleClose = () => { setShowModal(false); setEditing(null) }

  const handleToggle = async (m: Material) => {
    try {
      await apiClient.updateMaterial(m.id, { is_active: !m.is_active })
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao alternar status')
    }
  }

  const handleDelete = async (m: Material) => {
    if (!window.confirm(`Excluir "${m.title}"? Essa acao nao pode ser desfeita.`)) return
    try {
      await apiClient.deleteMaterial(m.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir material')
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Materiais</h1>
          <p className="text-gray-600 mt-2">Gerencie PDFs e materiais de estudo</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Material
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <FileDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Nenhum material cadastrado</p>
            <p className="text-sm text-gray-400">
              Clique em &ldquo;Novo Material&rdquo; para enviar o primeiro PDF.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Titulo</th>
                  <th className="px-6 py-3 text-left">Arquivo</th>
                  <th className="px-6 py-3 text-left">Tamanho</th>
                  <th className="px-6 py-3 text-left">Downloads</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Criado em</th>
                  <th className="px-6 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{m.title}</div>
                      {m.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{m.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {m.file_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatFileSize(m.file_size)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Download className="w-3.5 h-3.5" />
                        {m.download_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        m.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {m.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(m)}
                          className="text-gray-600 hover:text-gray-900"
                          title={m.is_active ? 'Desativar' : 'Ativar'}
                          aria-label={m.is_active ? 'Desativar' : 'Ativar'}
                        >
                          {m.is_active
                            ? <ToggleRight className="w-5 h-5" />
                            : <ToggleLeft className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => handleEdit(m)}
                          className="text-yellow-600 hover:text-yellow-800"
                          aria-label="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
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
          </div>
        )}
      </div>

      {showModal && (
        <MaterialFormModal
          editing={editing}
          onClose={handleClose}
          onSaved={async () => { handleClose(); await load() }}
        />
      )}
    </div>
  )
}

interface ModalProps {
  editing: Material | null
  onClose: () => void
  onSaved: () => Promise<void>
}

function MaterialFormModal({ editing, onClose, onSaved }: ModalProps) {
  const [title, setTitle] = useState(editing?.title || '')
  const [description, setDescription] = useState(editing?.description || '')
  const [isActive, setIsActive] = useState(editing?.is_active ?? true)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Titulo e obrigatorio')
      return
    }
    if (!editing && !file) {
      setError('Selecione um arquivo PDF')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await apiClient.updateMaterial(editing.id, {
          title: title.trim(),
          description: description.trim() || null,
          is_active: isActive,
        })
      } else {
        const formData = new FormData()
        formData.append('title', title.trim())
        if (description.trim()) formData.append('description', description.trim())
        formData.append('is_active', String(isActive))
        formData.append('file', file!)
        await apiClient.uploadMaterial(formData)
      }
      await onSaved()
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar material')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editing ? 'Editar Material' : 'Novo Material'}
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="mat-title" className="block text-sm font-medium text-gray-700 mb-1">
              Titulo
            </label>
            <input
              id="mat-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apostila de Navegacao"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="mat-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Descricao (opcional)
            </label>
            <textarea
              id="mat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descricao do material..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {!editing && (
            <div>
              <label htmlFor="mat-file" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo PDF
              </label>
              <div className="relative">
                <input
                  id="mat-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="mat-file"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  {file ? (
                    <span className="text-gray-700 font-medium truncate">
                      {file.name} ({formatFileSize(file.size)})
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      Clique para selecionar um PDF
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}

          {editing && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">Arquivo atual: </span>
              <span className="font-mono text-gray-700">{editing.file_name}</span>
              <span className="text-gray-400 ml-2">({formatFileSize(editing.file_size)})</span>
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Ativo (visivel para alunos)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Salvar' : 'Enviar Material'}
          </button>
        </div>
      </div>
    </div>
  )
}
