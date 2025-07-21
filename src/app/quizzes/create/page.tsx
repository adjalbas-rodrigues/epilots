'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  ChevronRight, 
  ChevronDown,
  Search,
  Filter,
  Settings,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Star,
  Flag,
  Hash,
  FileQuestion,
  Shuffle,
  MessageSquare,
  BarChart3,
  Loader2,
  X,
  TrendingUp,
  Info
} from 'lucide-react'

interface Subject {
  id: number
  name: string
  short_name: string | null
  color: string | null
  text_color: string | null
}

interface Topic {
  id: number
  name: string
  subject_id: number
}

export default function CreateQuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'subjects' | 'options' | 'base' | 'statement'>('options')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [expandedSubjects, setExpandedSubjects] = useState<number[]>([])
  const [statementText, setStatementText] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState('aleatorias')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBonus, setSelectedBonus] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({})
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([])
  const [quizName, setQuizName] = useState('Quest #45')

  // Mock data for counts
  const totalQuestions = 21304
  const ineditedQuestions = 5797
  const wrongAnswers = 259
  const correctAnswers = 421
  const favoriteQuestions = 45
  const flaggedQuestions = 23

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchSubjects()
  }, [user, router])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSubjects()
      setSubjects(response.data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      showToast('Erro ao carregar materias', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async (subjectId: number) => {
    try {
      const response = await apiClient.getSubjectWithTopics(subjectId)
      setTopics(prev => ({ ...prev, [subjectId]: response.data?.topics || [] }))
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSubject = async (subjectId: number) => {
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null)
      setSelectedTopicIds([])
      setExpandedSubjects(expandedSubjects.filter(id => id !== subjectId))
    } else {
      setSelectedSubjectId(subjectId)
      setSelectedTopicIds([])
      
      if (!topics[subjectId]) {
        await fetchTopics(subjectId)
      }
      
      if (!expandedSubjects.includes(subjectId)) {
        setExpandedSubjects([...expandedSubjects, subjectId])
      }
    }
  }

  const toggleTopic = (topicId: number) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== topicId))
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId])
    }
  }

  const handleCreateQuiz = async () => {
    if (!selectedSubjectId) {
      showToast('Selecione uma materia', 'error')
      return
    }

    try {
      setCreating(true)
      const response = await apiClient.createQuiz(
        selectedSubjectId,
        10, // Default question count
        selectedTopicIds.length > 0 ? selectedTopicIds : undefined
      )
      
      showToast('Quiz criado com sucesso!', 'success')
      router.push(`/quizzes/${response.data?.quizId}/perform`)
    } catch (error) {
      console.error('Error creating quiz:', error)
      showToast('Erro ao criar quiz', 'error')
    } finally {
      setCreating(false)
    }
  }

  const clearFilters = () => {
    setSelectedOrigin('aleatorias')
    setSelectedTypes([])
    setSelectedBonus([])
    setStatementText('')
    setSelectedSubjectId(null)
    setSelectedTopicIds([])
    setExpandedSubjects([])
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedOrigin !== 'aleatorias') count++
    if (selectedTypes.length > 0) count += selectedTypes.length
    if (selectedBonus.length > 0) count += selectedBonus.length
    if (selectedSubjectId) count++
    if (selectedTopicIds.length > 0) count += selectedTopicIds.length
    if (statementText) count++
    return count
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Quiz Config */}
            <div className="lg:col-span-2 space-y-6">
              {/* Nome do Quest */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Nome do Quest</h2>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('subjects')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'subjects'
                          ? 'text-red-600 border-red-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Assuntos e Materias
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('options')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'options'
                          ? 'text-red-600 border-red-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-red-600" />
                        Opcoes
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('base')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'base'
                          ? 'text-red-600 border-red-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        BASE
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('statement')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'statement'
                          ? 'text-red-600 border-red-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Enunciado
                      </div>
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'options' && (
                    <div className="space-y-6">
                      {/* Filtro de Questoes */}
                      <div>
                        <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-red-600" />
                          Filtro de Questoes
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">Configure os filtros para personalizar seu Quest</p>

                        {/* Origem das Questoes */}
                        <div className="mb-8">
                          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                            <Shuffle className="w-4 h-4 text-orange-500" />
                            Origem das Questoes
                            <span className="text-xs text-orange-600">(escolha apenas uma)</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <label 
                              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedOrigin === 'aleatorias' 
                                  ? 'border-orange-500 bg-orange-50' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name="origin"
                                value="aleatorias"
                                checked={selectedOrigin === 'aleatorias'}
                                onChange={(e) => setSelectedOrigin(e.target.value)}
                                className="sr-only"
                              />
                              {selectedOrigin === 'aleatorias' && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                  <Shuffle className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-medium text-gray-800">Aleatorias</span>
                              </div>
                              <div className="text-3xl font-bold text-gray-800 mb-1">6.304</div>
                              <p className="text-sm text-gray-600">Questoes aleatorias de todo o banco</p>
                            </label>

                            <label 
                              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedOrigin === 'ineditas' 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name="origin"
                                value="ineditas"
                                checked={selectedOrigin === 'ineditas'}
                                onChange={(e) => setSelectedOrigin(e.target.value)}
                                className="sr-only"
                              />
                              {selectedOrigin === 'ineditas' && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                                  <FileQuestion className="w-6 h-6 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-800">Ineditas</span>
                              </div>
                              <div className="text-3xl font-bold text-gray-800 mb-1">5.797</div>
                              <p className="text-sm text-gray-600">Questoes que voce nunca respondeu</p>
                            </label>
                          </div>
                        </div>

                        {/* Tipo de Questoes */}
                        <div className="mb-8">
                          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            Tipo de Questoes
                            <span className="text-xs text-blue-600">(escolha apenas uma)</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <label 
                              className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedTypes.includes('acertadas') 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value="acertadas"
                                checked={selectedTypes.includes('acertadas')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTypes(['acertadas'])
                                  } else {
                                    setSelectedTypes([])
                                  }
                                }}
                                className="sr-only"
                              />
                              <CheckCircle2 className="w-6 h-6 text-gray-400 mr-3" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">Acertadas</div>
                                <div className="text-sm text-gray-600">Questoes que voce acertou</div>
                              </div>
                              <div className="text-2xl font-bold text-gray-800">421</div>
                            </label>

                            <label 
                              className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedTypes.includes('erradas') 
                                  ? 'border-red-500 bg-red-50' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value="erradas"
                                checked={selectedTypes.includes('erradas')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTypes(['erradas'])
                                  } else {
                                    setSelectedTypes([])
                                  }
                                }}
                                className="sr-only"
                              />
                              <XCircle className="w-6 h-6 text-gray-400 mr-3" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">Erradas</div>
                                <div className="text-sm text-gray-600">Questoes que voce errou anteriormente</div>
                              </div>
                              <div className="text-2xl font-bold text-gray-800">259</div>
                            </label>
                          </div>
                        </div>

                        {/* Filtros Adicionais */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-green-500" />
                            Filtros Adicionais
                            <span className="text-xs text-green-600">(multipla escolha)</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <label 
                              className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedBonus.includes('favoritas') 
                                  ? 'border-yellow-500 bg-yellow-50' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value="favoritas"
                                checked={selectedBonus.includes('favoritas')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBonus([...selectedBonus, 'favoritas'])
                                  } else {
                                    setSelectedBonus(selectedBonus.filter(b => b !== 'favoritas'))
                                  }
                                }}
                                className="sr-only"
                              />
                              <Star className="w-6 h-6 text-gray-400 mr-3" />
                              <div className="flex-1 font-medium text-gray-800">Favoritas</div>
                              <div className="text-2xl font-bold text-gray-800">45</div>
                            </label>

                            <label 
                              className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedBonus.includes('flagged') 
                                  ? 'border-purple-500 bg-purple-50' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value="flagged"
                                checked={selectedBonus.includes('flagged')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBonus([...selectedBonus, 'flagged'])
                                  } else {
                                    setSelectedBonus(selectedBonus.filter(b => b !== 'flagged'))
                                  }
                                }}
                                className="sr-only"
                              />
                              <Flag className="w-6 h-6 text-gray-400 mr-3" />
                              <div className="flex-1 font-medium text-gray-800">Flagged</div>
                              <div className="text-2xl font-bold text-gray-800">23</div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'subjects' && (
                    <div>
                      <h3 className="text-base font-medium text-gray-800 mb-6">Selecione os assuntos para filtrar as questoes</h3>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar materia..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredSubjects.map((subject) => (
                          <div key={subject.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleSubject(subject.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                selectedSubjectId === subject.id ? 'bg-red-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  checked={selectedSubjectId === subject.id}
                                  onChange={() => {}}
                                  className="text-red-500 focus:ring-red-500"
                                />
                                <span className="text-gray-700">{subject.name}</span>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedSubjects.includes(subject.id) ? 'rotate-180' : ''
                              }`} />
                            </button>
                            
                            {expandedSubjects.includes(subject.id) && topics[subject.id] && (
                              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                <div className="space-y-2">
                                  {topics[subject.id].map((topic) => (
                                    <label key={topic.id} className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedTopicIds.includes(topic.id)}
                                        onChange={() => toggleTopic(topic.id)}
                                        className="text-red-500 focus:ring-red-500 rounded"
                                      />
                                      <span className="text-gray-700">{topic.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'base' && (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
                    </div>
                  )}

                  {activeTab === 'statement' && (
                    <div>
                      <h3 className="text-base font-medium text-gray-800 mb-6">Busca por Enunciado</h3>
                      <input
                        type="text"
                        value={statementText}
                        onChange={(e) => setStatementText(e.target.value)}
                        placeholder="Digite palavras-chave do enunciado..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Filtros Selecionados */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros Selecionados
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Limpar Tudo
                  </button>
                </div>

                {/* Numero de questoes */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <FileQuestion className="w-12 h-12 text-blue-600" />
                    <div className="text-5xl font-bold text-gray-800">{totalQuestions.toLocaleString()}</div>
                  </div>
                  <p className="text-gray-600">questoes</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <p className="text-sm text-orange-600">{getActiveFiltersCount()} filtros ativos</p>
                  </div>
                </div>

                {/* Selected Filters Display */}
                {getActiveFiltersCount() === 0 ? (
                  <div className="text-center py-8 border-t border-gray-200">
                    <p className="text-gray-500 text-sm">Nenhum filtro selecionado</p>
                    <p className="text-gray-400 text-xs mt-1">Selecione filtros a esquerda para comecar</p>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    {selectedOrigin !== 'aleatorias' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Origem:</span>
                        <span className="font-medium text-gray-800">Ineditas</span>
                      </div>
                    )}
                    {selectedTypes.map(type => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium text-gray-800">{type}</span>
                      </div>
                    ))}
                    {selectedBonus.map(bonus => (
                      <div key={bonus} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Filtro:</span>
                        <span className="font-medium text-gray-800">{bonus}</span>
                      </div>
                    ))}
                    {selectedSubjectId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Materia:</span>
                        <span className="font-medium text-gray-800">
                          {subjects.find(s => s.id === selectedSubjectId)?.name}
                        </span>
                      </div>
                    )}
                    {selectedTopicIds.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Topicos:</span>
                        <span className="font-medium text-gray-800">{selectedTopicIds.length} selecionados</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gerar Quest Button */}
              <button
                onClick={handleCreateQuiz}
                disabled={!selectedSubjectId || creating}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  selectedSubjectId && !creating
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    GERANDO QUEST...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    GERAR QUEST
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}