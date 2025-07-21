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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])
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
    if (expandedSubjects.includes(subjectId)) {
      setExpandedSubjects(expandedSubjects.filter(id => id !== subjectId))
    } else {
      if (!topics[subjectId]) {
        await fetchTopics(subjectId)
      }
      setExpandedSubjects([...expandedSubjects, subjectId])
    }
  }

  const toggleSubjectSelection = (subjectId: number) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subjectId))
      // Remove todos os tópicos dessa matéria
      if (topics[subjectId]) {
        const topicIds = topics[subjectId].map(t => t.id)
        setSelectedTopicIds(selectedTopicIds.filter(id => !topicIds.includes(id)))
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId])
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
    if (selectedSubjectIds.length === 0 && selectedTopicIds.length === 0) {
      showToast('Selecione pelo menos uma materia ou topico', 'error')
      return
    }

    try {
      setCreating(true)
      // TODO: Atualizar API para suportar múltiplas matérias
      const response = await apiClient.createQuiz(
        selectedSubjectIds[0], // Por enquanto usa a primeira matéria selecionada
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
    setSelectedSubjectIds([])
    setSelectedTopicIds([])
    setExpandedSubjects([])
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedOrigin !== 'aleatorias') count++
    if (selectedTypes.length > 0) count += selectedTypes.length
    if (selectedBonus.length > 0) count += selectedBonus.length
    if (selectedSubjectIds.length > 0) count += selectedSubjectIds.length
    if (selectedTopicIds.length > 0) count += selectedTopicIds.length
    if (statementText) count++
    return count
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <Breadcrumbs />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Skeleton for Nome do Quest */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
                
                {/* Skeleton for Tabs */}
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b border-gray-200 p-1">
                    <div className="flex gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
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
              <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Nome do Quest</h2>
                  <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" title="De um nome para identificar seu quiz" />
                </div>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="Digite o nome do quiz..."
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
                    <div className="space-y-6 animate-fade-in">
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
                              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                                selectedOrigin === 'aleatorias' 
                                  ? 'border-orange-500 bg-orange-50 scale-[1.02] shadow-lg' 
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
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-scale-in">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                  selectedOrigin === 'aleatorias' ? 'bg-orange-500 animate-pulse' : 'bg-orange-500'
                                }`}>
                                  <Shuffle className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-medium text-gray-800">Aleatorias</span>
                              </div>
                              <div className="text-3xl font-bold text-gray-800 mb-1 transition-all duration-300">6.304</div>
                              <p className="text-sm text-gray-600">Questoes aleatorias de todo o banco</p>
                            </label>

                            <label 
                              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                                selectedOrigin === 'ineditas' 
                                  ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' 
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
                                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-scale-in">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                  selectedOrigin === 'ineditas' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                                }`}>
                                  <FileQuestion className={`w-6 h-6 transition-colors duration-300 ${
                                    selectedOrigin === 'ineditas' ? 'text-white' : 'text-gray-600'
                                  }`} />
                                </div>
                                <span className="font-medium text-gray-800">Ineditas</span>
                              </div>
                              <div className="text-3xl font-bold text-gray-800 mb-1 transition-all duration-300">5.797</div>
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
                              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group ${
                                selectedTypes.includes('acertadas') 
                                  ? 'border-green-500 bg-green-50 scale-[1.02] shadow-md' 
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
                              <CheckCircle2 className={`w-6 h-6 mr-3 transition-colors duration-300 ${
                                selectedTypes.includes('acertadas') ? 'text-green-500' : 'text-gray-400 group-hover:text-green-400'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">Acertadas</div>
                                <div className="text-sm text-gray-600">Questoes que voce acertou</div>
                              </div>
                              <div className={`text-2xl font-bold transition-all duration-300 ${
                                selectedTypes.includes('acertadas') ? 'text-green-600' : 'text-gray-800'
                              }`}>421</div>
                            </label>

                            <label 
                              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group ${
                                selectedTypes.includes('erradas') 
                                  ? 'border-red-500 bg-red-50 scale-[1.02] shadow-md' 
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
                              <XCircle className={`w-6 h-6 mr-3 transition-colors duration-300 ${
                                selectedTypes.includes('erradas') ? 'text-red-500' : 'text-gray-400 group-hover:text-red-400'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">Erradas</div>
                                <div className="text-sm text-gray-600">Questoes que voce errou anteriormente</div>
                              </div>
                              <div className={`text-2xl font-bold transition-all duration-300 ${
                                selectedTypes.includes('erradas') ? 'text-red-600' : 'text-gray-800'
                              }`}>259</div>
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
                              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group ${
                                selectedBonus.includes('favoritas') 
                                  ? 'border-yellow-500 bg-yellow-50 scale-[1.02] shadow-md' 
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
                              <Star className={`w-6 h-6 mr-3 transition-all duration-300 ${
                                selectedBonus.includes('favoritas') ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 group-hover:text-yellow-400'
                              }`} />
                              <div className="flex-1 font-medium text-gray-800">Favoritas</div>
                              <div className={`text-2xl font-bold transition-all duration-300 ${
                                selectedBonus.includes('favoritas') ? 'text-yellow-600' : 'text-gray-800'
                              }`}>45</div>
                            </label>

                            <label 
                              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group ${
                                selectedBonus.includes('flagged') 
                                  ? 'border-purple-500 bg-purple-50 scale-[1.02] shadow-md' 
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
                              <Flag className={`w-6 h-6 mr-3 transition-all duration-300 ${
                                selectedBonus.includes('flagged') ? 'text-purple-500 fill-purple-500' : 'text-gray-400 group-hover:text-purple-400'
                              }`} />
                              <div className="flex-1 font-medium text-gray-800">Flagged</div>
                              <div className={`text-2xl font-bold transition-all duration-300 ${
                                selectedBonus.includes('flagged') ? 'text-purple-600' : 'text-gray-800'
                              }`}>23</div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'subjects' && (
                    <div>
                      <h3 className="text-base font-medium text-gray-800 mb-2">Selecione os assuntos para filtrar as questoes</h3>
                      <p className="text-sm text-gray-600 mb-6">Escolha uma materia inteira ou selecione topicos especificos</p>
                      
                      <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar materia..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredSubjects.map((subject, index) => (
                          <div 
                            key={subject.id} 
                            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in-right group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <button
                              onClick={() => toggleSubject(subject.id)}
                              className={`w-full px-4 py-4 text-left transition-all duration-300 flex items-center justify-between ${
                                selectedSubjectIds.includes(subject.id) 
                                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500' 
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                  selectedSubjectIds.includes(subject.id) 
                                    ? 'bg-red-500 shadow-lg animate-scale-in scale-110' 
                                    : 'bg-gray-100 group-hover:scale-105'
                                }`}>
                                  <svg className={`w-6 h-6 transition-colors duration-300 ${selectedSubjectIds.includes(subject.id) ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-medium transition-colors duration-300 ${selectedSubjectIds.includes(subject.id) ? 'text-red-700' : 'text-gray-800 group-hover:text-gray-900'}`}>
                                    {subject.name}
                                  </h4>
                                  {topics[subject.id] && (
                                    <p className="text-sm text-gray-500 mt-1 transition-all duration-300 group-hover:text-gray-600">
                                      {topics[subject.id].length} topicos disponiveis
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {selectedSubjectIds.includes(subject.id) && (
                                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-fade-in">
                                    Selecionado
                                  </div>
                                )}
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
                                  expandedSubjects.includes(subject.id) ? 'rotate-180' : ''
                                } group-hover:text-gray-600`} />
                              </div>
                            </button>
                            
                            {expandedSubjects.includes(subject.id) && topics[subject.id] && (
                              <div className="bg-gradient-to-b from-gray-50 to-white px-4 py-4 border-t border-gray-200 animate-slide-down">
                                <div className="mb-3">
                                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubjectIds.includes(subject.id)}
                                      onChange={() => toggleSubjectSelection(subject.id)}
                                      className="w-4 h-4 text-red-500 focus:ring-red-500 rounded transition-transform duration-200 group-hover:scale-110"
                                    />
                                    <span className="font-medium text-gray-700 group-hover:text-gray-900">Selecionar toda a materia</span>
                                  </label>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-3">
                                  <p className="text-sm text-gray-600 mb-3">Ou escolha topicos especificos:</p>
                                  <div className="grid gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {topics[subject.id].map((topic, topicIndex) => (
                                      <label 
                                        key={topic.id} 
                                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group animate-fade-in"
                                        style={{ animationDelay: `${topicIndex * 30}ms` }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedTopicIds.includes(topic.id)}
                                          onChange={() => toggleTopic(topic.id)}
                                          className="w-4 h-4 text-red-500 focus:ring-red-500 rounded transition-transform duration-200 group-hover:scale-110"
                                        />
                                        <svg className="w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-700 group-hover:text-gray-900">{topic.name}</span>
                                      </label>
                                    ))}
                                  </div>
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
                    <FileQuestion className="w-12 h-12 text-blue-600 animate-float" />
                    <div className="text-5xl font-bold text-gray-800 transition-all duration-500 transform hover:scale-105">
                      {totalQuestions.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-gray-600">questoes</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <TrendingUp className={`w-4 h-4 text-orange-500 transition-transform duration-300 ${
                      getActiveFiltersCount() > 0 ? 'animate-bounce' : ''
                    }`} />
                    <p className="text-sm text-orange-600 transition-all duration-300">
                      {getActiveFiltersCount()} filtros ativos
                    </p>
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
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-1">Origem:</div>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          <FileQuestion className="w-3 h-3" />
                          Ineditas
                          <button
                            onClick={() => setSelectedOrigin('aleatorias')}
                            className="ml-1 hover:text-orange-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedTypes.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-1">Tipo:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedTypes.map(type => (
                            <div key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              {type === 'acertadas' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {type === 'acertadas' ? 'Acertadas' : 'Erradas'}
                              <button
                                onClick={() => setSelectedTypes([])}
                                className="ml-1 hover:text-green-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedBonus.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-1">Filtros:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedBonus.map(bonus => (
                            <div key={bonus} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              {bonus === 'favoritas' ? <Star className="w-3 h-3" /> : <Flag className="w-3 h-3" />}
                              {bonus === 'favoritas' ? 'Favoritas' : 'Flagged'}
                              <button
                                onClick={() => setSelectedBonus(selectedBonus.filter(b => b !== bonus))}
                                className="ml-1 hover:text-purple-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSubjectIds.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-1">Materias:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSubjectIds.map(subjectId => {
                            const subject = subjects.find(s => s.id === subjectId)
                            return subject ? (
                              <div key={subjectId} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {subject.name}
                                <button
                                  onClick={() => toggleSubjectSelection(subjectId)}
                                  className="ml-1 hover:text-red-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {selectedTopicIds.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-1">Topicos:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedTopicIds.map(topicId => {
                            // Encontrar o tópico em todos os subjects
                            let topicName = ''
                            for (const subjectId in topics) {
                              const topic = topics[subjectId].find(t => t.id === topicId)
                              if (topic) {
                                topicName = topic.name
                                break
                              }
                            }
                            return topicName ? (
                              <div key={topicId} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                {topicName}
                                <button
                                  onClick={() => toggleTopic(topicId)}
                                  className="ml-1 hover:text-blue-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gerar Quest Button */}
              <button
                onClick={handleCreateQuiz}
                disabled={(selectedSubjectIds.length === 0 && selectedTopicIds.length === 0) || creating}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] ${
                  (selectedSubjectIds.length > 0 || selectedTopicIds.length > 0) && !creating
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl animate-pulse'
                    : 'bg-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    GERANDO QUEST...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 animate-float" />
                    GERAR QUEST
                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
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