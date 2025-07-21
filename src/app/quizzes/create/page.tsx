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
      // Seleciona todos os tópicos dessa matéria
      if (topics[subjectId]) {
        const topicIds = topics[subjectId].map(t => t.id)
        setSelectedTopicIds([...selectedTopicIds, ...topicIds])
      }
    }
  }
  
  const isAllTopicsSelected = (subjectId: number) => {
    if (!topics[subjectId]) return false
    const subjectTopicIds = topics[subjectId].map(t => t.id)
    return subjectTopicIds.every(id => selectedTopicIds.includes(id))
  }

  const toggleTopic = (topicId: number, subjectId: number) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== topicId))
      // Se estava com todos os tópicos selecionados, remove a matéria da lista
      if (selectedSubjectIds.includes(subjectId) && topics[subjectId]) {
        const subjectTopicIds = topics[subjectId].map(t => t.id)
        const remainingTopics = subjectTopicIds.filter(id => selectedTopicIds.includes(id) && id !== topicId)
        if (remainingTopics.length === 0) {
          setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subjectId))
        }
      }
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId])
      // Se agora todos os tópicos estão selecionados, adiciona a matéria
      if (topics[subjectId]) {
        const subjectTopicIds = topics[subjectId].map(t => t.id)
        const allSelected = subjectTopicIds.every(id => id === topicId || selectedTopicIds.includes(id))
        if (allSelected && !selectedSubjectIds.includes(subjectId)) {
          setSelectedSubjectIds([...selectedSubjectIds, subjectId])
        }
      }
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
                              className={`relative flex flex-col p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedOrigin === 'aleatorias' 
                                  ? 'border-[#eb1c2d] bg-red-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
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
                                <div className="absolute top-3 right-3 w-6 h-6 bg-[#eb1c2d] rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  selectedOrigin === 'aleatorias' ? 'bg-[#eb1c2d]' : 'bg-gray-100'
                                }`}>
                                  <Shuffle className={`w-6 h-6 ${selectedOrigin === 'aleatorias' ? 'text-white' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 text-sm">Aleatorias</span>
                                  <div className="text-2xl font-bold text-[#eb1c2d]">6.304</div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">Questoes aleatorias de todo o banco</p>
                            </label>

                            <label 
                              className={`relative flex flex-col p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedOrigin === 'ineditas' 
                                  ? 'border-[#eb1c2d] bg-red-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
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
                                <div className="absolute top-3 right-3 w-6 h-6 bg-[#eb1c2d] rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                  selectedOrigin === 'ineditas' ? 'bg-[#eb1c2d] border-[#eb1c2d]' : 'bg-white border-gray-200'
                                }`}>
                                  <FileQuestion className={`w-6 h-6 ${selectedOrigin === 'ineditas' ? 'text-white' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 text-sm">Ineditas</span>
                                  <div className="text-2xl font-bold text-[#eb1c2d]">5.797</div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">Questoes que voce nunca respondeu</p>
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
                              className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedTypes.includes('acertadas') 
                                  ? 'border-green-500 bg-green-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
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
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                selectedTypes.includes('acertadas') ? 'bg-green-500' : 'bg-gray-100'
                              }`}>
                                <CheckCircle2 className={`w-5 h-5 ${selectedTypes.includes('acertadas') ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">Acertadas</div>
                                <div className="text-xs text-gray-500">Questoes que voce acertou</div>
                              </div>
                              <div className="text-2xl font-bold text-green-600">421</div>
                            </label>

                            <label 
                              className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedTypes.includes('erradas') 
                                  ? 'border-red-500 bg-red-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
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
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                selectedTypes.includes('erradas') ? 'bg-red-500' : 'bg-gray-100'
                              }`}>
                                <XCircle className={`w-5 h-5 ${selectedTypes.includes('erradas') ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">Erradas</div>
                                <div className="text-xs text-gray-500">Questoes que voce errou anteriormente</div>
                              </div>
                              <div className="text-2xl font-bold text-red-600">259</div>
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
                              className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedBonus.includes('favoritas') 
                                  ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
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
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                selectedBonus.includes('favoritas') ? 'bg-yellow-500' : 'bg-gray-100'
                              }`}>
                                <Star className={`w-5 h-5 ${selectedBonus.includes('favoritas') ? 'text-white fill-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">Favoritas</div>
                              </div>
                              <div className="text-2xl font-bold text-yellow-600">45</div>
                            </label>

                            <label 
                              className={`relative flex items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedBonus.includes('flagged') 
                                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
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
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                selectedBonus.includes('flagged') ? 'bg-purple-500' : 'bg-gray-100'
                              }`}>
                                <Flag className={`w-5 h-5 ${selectedBonus.includes('flagged') ? 'text-white fill-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">Flagged</div>
                              </div>
                              <div className="text-2xl font-bold text-purple-600">23</div>
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
                            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-in-right"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <button
                              onClick={() => toggleSubject(subject.id)}
                              className={`w-full px-5 py-5 text-left transition-all duration-300 flex items-center justify-between ${
                                isAllTopicsSelected(subject.id) 
                                  ? 'bg-red-50' 
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  isAllTopicsSelected(subject.id) 
                                    ? 'bg-[#eb1c2d] shadow-lg' 
                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                }`}>
                                  <svg className={`w-6 h-6 transition-colors duration-300 ${isAllTopicsSelected(subject.id) ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-bold text-gray-900 transition-colors duration-300`}>
                                    {subject.name}
                                  </h4>
                                  {topics[subject.id] && (
                                    <p className="text-sm text-gray-500 mt-0.5">
                                      {topics[subject.id].filter(t => selectedTopicIds.includes(t.id)).length} de {topics[subject.id].length} assuntos
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
                                expandedSubjects.includes(subject.id) ? 'rotate-180' : ''
                              }`} />
                            </button>
                            
                            {expandedSubjects.includes(subject.id) && topics[subject.id] && (
                              <div className="bg-gradient-to-b from-gray-50 to-white px-4 py-4 border-t border-gray-200 animate-slide-down">
                                <div className="mb-3">
                                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                                    <input
                                      type="checkbox"
                                      checked={isAllTopicsSelected(subject.id)}
                                      onChange={() => toggleSubjectSelection(subject.id)}
                                      className="w-4 h-4 text-red-500 focus:ring-red-500 rounded transition-transform duration-200 group-hover:scale-110"
                                    />
                                    <span className="font-medium text-gray-700 group-hover:text-gray-900">Selecionar todos os assuntos</span>
                                  </label>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-3">
                                  <p className="text-sm text-gray-600 mb-3">Ou escolha assuntos especificos:</p>
                                  <div className="grid gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {topics[subject.id].map((topic, topicIndex) => (
                                      <label 
                                        key={topic.id} 
                                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                                          selectedTopicIds.includes(topic.id) 
                                            ? 'bg-blue-50 border border-blue-200' 
                                            : 'hover:bg-gray-100 border border-transparent'
                                        }`}
                                        style={{ animationDelay: `${topicIndex * 30}ms` }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedTopicIds.includes(topic.id)}
                                          onChange={() => toggleTopic(topic.id, subject.id)}
                                          className="w-4 h-4 text-[#eb1c2d] focus:ring-[#eb1c2d] rounded"
                                        />
                                        <svg className={`w-4 h-4 ${selectedTopicIds.includes(topic.id) ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className={`${selectedTopicIds.includes(topic.id) ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                          {topic.name}
                                        </span>
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
                    {subjects.map(subject => {
                      const subjectTopics = topics[subject.id] || []
                      const selectedSubjectTopics = subjectTopics.filter(t => selectedTopicIds.includes(t.id))
                      const isFullSubject = isAllTopicsSelected(subject.id)
                      
                      if (selectedSubjectTopics.length === 0) return null
                      
                      return (
                        <div key={subject.id} className="space-y-2 pb-3 border-b border-gray-100 last:border-0">
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {subject.name}
                            {isFullSubject && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Completa</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {isFullSubject ? (
                              <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                Todos os assuntos
                                <button
                                  onClick={() => toggleSubjectSelection(subject.id)}
                                  className="ml-1 hover:text-red-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              selectedSubjectTopics.map(topic => (
                                <div key={topic.id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  {topic.name}
                                  <button
                                    onClick={() => toggleTopic(topic.id, subject.id)}
                                    className="ml-1 hover:text-blue-900"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Gerar Quest Button */}
              <button
                onClick={handleCreateQuiz}
                disabled={(selectedSubjectIds.length === 0 && selectedTopicIds.length === 0) || creating}
                className={`w-full py-5 px-8 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${
                  (selectedSubjectIds.length > 0 || selectedTopicIds.length > 0) && !creating
                    ? 'bg-[#eb1c2d] hover:bg-[#d91929] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gerando Quest...</span>
                  </>
                ) : (
                  <>
                    <span>Gerar Quest</span>
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