'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import type { Subject, Topic, Matter, QuestionBase } from '@/types'
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
  Info,
  Folder,
  FolderOpen,
  File,
  FileText,
  Check,
  Minus,
  CircleDot,
  Library,
  GraduationCap,
  Brain,
  Lightbulb,
  Target,
  Zap,
  CheckSquare,
  Square,
  MinusSquare,
  PlusSquare,
  Activity,
  Layers,
  BookMarked,
  Tags,
  FolderTree,
  Database,
  ListTree,
  Package,
  Award,
  Trophy
} from 'lucide-react'

// interface Topic {
//   id: number
//   name: string
//   subject_id: number
//   matterId?: number
//   matter?: Matter
// }
// interface Subject {
//   id: number
//   name: string
//   short_name: string | null
//   color: string | null
//   text_color: string | null
//   topics: Topic[]
// }



// interface Matter {
//   id: number
//   name: string
//   topics: Topic[]
// }

export default function CreateQuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'quizmode' | 'subjects' | 'matters' | 'options' | 'base' | 'statement'>('quizmode')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermMatter, setSearchTermMatter] = useState('')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])
  const [selectedMatterIds, setSelectedMatterIds] = useState<number[]>([])
  const [expandedSubjects, setExpandedSubjects] = useState<number[]>([])
  const [expandedMatters, setExpandedMatters] = useState<number[]>([])
  const [statementText, setStatementText] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState('aleatorias')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBonus, setSelectedBonus] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({})
  const [topicsByMatter, setTopicsByMatter] = useState<{ [key: number]: Topic[] }>({})
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([])
  const [selectedTopicIdsByMatter, setSelectedTopicIdsByMatter] = useState<number[]>([])
  const [quizName, setQuizName] = useState('Quest #45')
  const [questionCount, setQuestionCount] = useState(20)
  const [feedbackMode, setFeedbackMode] = useState<'immediate' | 'end'>('immediate')
  const [bases, setBases] = useState<QuestionBase[]>([])
  const [selectedBaseIds, setSelectedBaseIds] = useState<number[]>([])
  const [searchTermBase, setSearchTermBase] = useState('')
  const [onlyWrong, setOnlyWrong] = useState(false)
  const [onlyMarked, setOnlyMarked] = useState(false)
  const [quizMode, setQuizMode] = useState<'complete' | 'inedited' | 'review' | 'superquest' >('complete')

  // Question counts
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [loadingCount, setLoadingCount] = useState(false)
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0)
  const [markedQuestionsCount, setMarkedQuestionsCount] = useState(0)
  const [loadingReviewStats, setLoadingReviewStats] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchSubjectsAndMatters()
    fetchReviewStats()
  }, [user, router])

  // Handle SuperQuest mode
  useEffect(() => {
    if (quizMode === 'superquest') {
      setQuestionCount(70)
      setSelectedBaseIds([3]) // baseId = 3 for simulados
      // Clear other filters
      setSelectedSubjectIds([])
      setSelectedMatterIds([])
      setSelectedTopicIds([])
      setSelectedTopicIdsByMatter([])
      setStatementText('')
    } else if (quizMode === 'review') {
      setOnlyWrong(true)
      setOnlyMarked(false)
    } else if (quizMode === 'inedited') {
      setOnlyWrong(false)
      setOnlyMarked(false)
      // Will be handled in the backend
    } else {
      // Complete mode
      setOnlyWrong(false)
      setOnlyMarked(false)
    }
  }, [quizMode])

  // Update question count when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If review options are selected, use the review counts
      if (onlyWrong) {
        setTotalQuestions(wrongQuestionsCount)
      } else if (onlyMarked) {
        setTotalQuestions(markedQuestionsCount)
      } else {
        fetchQuestionCount()
      }
    }, 500) // Debounce para evitar muitas requisições
    
    return () => clearTimeout(timeoutId)
  }, [selectedTopicIds, selectedTopicIdsByMatter, selectedBaseIds, statementText, onlyWrong, onlyMarked, wrongQuestionsCount, markedQuestionsCount])

  const fetchSubjectsAndMatters = async () => {
    try {
      setLoading(true)
      const [
  { data: subjectsResponse },
  { data: mattersResponse },
  { data: basesResponse }
] = await Promise.all([
  apiClient.getSubjects(),
  apiClient.getMatters(),
  apiClient.getQuestionBases()
]) as [{ data :Subject[] }, { data :Matter[] }, { data :QuestionBase[] }];


      // const newTopics: { [key: string]: Topic[] } = {};
      // subjectsResponse.data?.forEach(s => {
      //   newTopics[s.id]: s.topics 
      // })
      setSubjects(subjectsResponse|| [])
      setMatters(mattersResponse|| [])
      setBases(basesResponse|| [])
      
      // Fetch initial question count
      fetchQuestionCount()
    } catch (error) {
      console.error('Error fetching data:', error)
      showToast('Erro ao carregar dados', 'error')
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

  const fetchTopicsByMatter = async (matterId: number) => {
    try {
      const response = await apiClient.getMatterWithTopics(matterId)
      setTopicsByMatter(prev => ({ ...prev, [matterId]: response.data?.topics || [] }))
    } catch (error) {
      console.error('Error fetching topics by matter:', error)
    }
  }

  const fetchQuestionCount = async () => {
    if (loadingCount) return
    
    try {
      setLoadingCount(true)
      
      // Combinar todos os topicIds selecionados
      const allTopicIds = [...new Set([...selectedTopicIds, ...selectedTopicIdsByMatter])]
      
      const response = await apiClient.getQuestionCount(
        allTopicIds,
        selectedBaseIds,
        statementText || undefined
      )
      
      setTotalQuestions(response.data?.count || 0)
    } catch (error) {
      console.error('Error fetching question count:', error)
      setTotalQuestions(0)
    } finally {
      setLoadingCount(false)
    }
  }

  const fetchReviewStats = async () => {
    if (loadingReviewStats) return
    
    try {
      setLoadingReviewStats(true)
      const response = await apiClient.getReviewStats()
      
      if (response.data) {
        setWrongQuestionsCount(response.data.wrongQuestions || 0)
        setMarkedQuestionsCount(response.data.markedQuestions || 0)
      }
    } catch (error) {
      console.error('Error fetching review stats:', error)
      setWrongQuestionsCount(0)
      setMarkedQuestionsCount(0)
    } finally {
      setLoadingReviewStats(false)
    }
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    subject.topics && subject.topics.length > 0
  )

  const filteredMatters = matters.filter(matter =>
    matter.name.toLowerCase().includes(searchTermMatter.toLowerCase()) &&
    matter.topics && matter.topics.length > 0
  )

  const toggleSubject = async (subjectId: number) => {
    if (expandedSubjects.includes(subjectId)) {
      setExpandedSubjects(expandedSubjects.filter(id => id !== subjectId))
    } else {
      // if (!subjects?.find(s => s.id === subjectId)?.topics) {
      //   await fetchTopics(subjectId)
      // }
      setExpandedSubjects([...expandedSubjects, subjectId])
    }
  }

  const toggleSubjectSelection = (subjectId: number) => {
    const subjectTopics = subjects?.find(s => s.id === subjectId)?.topics || []
    if (subjectTopics?.length === 0) return
    
    const allTopicsSelected = subjectTopics?.every(t => selectedTopicIds.includes(t.id))
    
    if (allTopicsSelected) {
      // Desmarcar todos
      const topicIds = subjectTopics?.map(t => t.id)
      setSelectedTopicIds(selectedTopicIds.filter(id => !topicIds.includes(id)))
      // Remove subject from selected
      setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subjectId))
    } else {
      // Marcar todos
      const topicIds = subjectTopics?.map(t => t.id)
      setSelectedTopicIds([...new Set([...selectedTopicIds, ...topicIds])])
      // Add subject to selected
      if (!selectedSubjectIds.includes(subjectId)) {
        setSelectedSubjectIds([...selectedSubjectIds, subjectId])
      }
    }
  }
  
  const isAllTopicsSelected = (subjectId: number) => {
    if (!subjects?.find(s => s.id === subjectId)?.topics || subjects?.find(s => s.id === subjectId)?.topics?.length === 0) return false
    return subjects?.find(s => s.id === subjectId)?.topics?.every(t => selectedTopicIds.includes(t.id))
  }

  const isPartiallySelected = (subjectId: number) => {
    if (!subjects?.find(s => s.id === subjectId)?.topics || subjects?.find(s => s.id === subjectId)?.topics?.length === 0) return false
    const selectedCount = subjects?.find(s => s.id === subjectId)?.topics?.filter(t => selectedTopicIds.includes(t.id)).length || 0
    return selectedCount > 0 && selectedCount < (subjects?.find(s => s.id === subjectId)?.topics?.length || 0)
  }

  const toggleTopic = (topicId: number, subjectId: number) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== topicId))
      // Remove subject if no more topics selected
      const remainingTopics = selectedTopicIds.filter(id => id !== topicId)
      const hasOtherTopicsFromSubject = subjects?.find(s => s.id === subjectId)?.topics?.some(t => 
        t.id !== topicId && remainingTopics?.includes(t.id)
      )
      if (!hasOtherTopicsFromSubject) {
        setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subjectId))
      }
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId])
      // Add subject if not already selected
      if (!selectedSubjectIds.includes(subjectId)) {
        setSelectedSubjectIds([...selectedSubjectIds, subjectId])
      }
    }
  }

  const toggleMatter = async (matterId: number) => {
    if (expandedMatters.includes(matterId)) {
      setExpandedMatters(expandedMatters.filter(id => id !== matterId))
    } else {
      if (!matters.find(m=> m.id === matterId)?.topics) {
        await fetchTopicsByMatter(matterId)
      }
      setExpandedMatters([...expandedMatters, matterId])
    }
  }

  const toggleMatterSelection = (matterId: number) => {
    const matterTopics = matters.find(m=> m.id === matterId)?.topics || []
    if (matterTopics?.length === 0) return
    
    const allTopicsSelected = matterTopics?.every(t => selectedTopicIdsByMatter.includes(t.id))
    
    if (allTopicsSelected) {
      // Desmarcar todos
      const topicIds = matterTopics?.map(t => t.id)
      setSelectedTopicIdsByMatter(selectedTopicIdsByMatter.filter(id => !topicIds.includes(id)))
    } else {
      // Marcar todos
      const topicIds = matterTopics?.map(t => t.id)
      setSelectedTopicIdsByMatter([...new Set([...selectedTopicIdsByMatter, ...topicIds])])
    }
  }
  
  const isAllTopicsSelectedByMatter = (matterId: number) => {
    if (!matters.find(m=> m.id === matterId)?.topics || matters.find(m=> m.id === matterId)?.topics?.length === 0) return false
    return matters.find(m=> m.id === matterId)?.topics?.every(t => selectedTopicIdsByMatter.includes(t.id))
  }

  const isPartiallySelectedByMatter = (matterId: number) => {
    if (!matters.find(m=> m.id === matterId)?.topics || matters.find(m=> m.id === matterId)?.topics?.length === 0) return false
    const selectedCount = matters.find(m=> m.id === matterId)?.topics?.filter(t => selectedTopicIdsByMatter.includes(t.id)).length || 0
    return selectedCount > 0 && selectedCount < (matters.find(m=> m.id === matterId)?.topics?.length || 0)
  }

  const toggleTopicByMatter = (topicId: number, matterId: number) => {
    if (selectedTopicIdsByMatter.includes(topicId)) {
      setSelectedTopicIdsByMatter(selectedTopicIdsByMatter.filter(id => id !== topicId))
    } else {
      setSelectedTopicIdsByMatter([...selectedTopicIdsByMatter, topicId])
    }
  }

  const handleCreateQuiz = async () => {
    // Permitir criar quiz sem filtros - irá usar questões aleatórias de todo o banco

    try {
      setCreating(true)
      
      // Configurar parâmetros baseados no quizMode
      let finalTopicIds = [...new Set([...selectedTopicIds, ...selectedTopicIdsByMatter])]
      let finalBaseIds = selectedBaseIds.length > 0 ? selectedBaseIds : undefined
      let finalQuestionCount = questionCount
      let finalOnlyWrong = onlyWrong
      let finalOnlyMarked = onlyMarked
      let inedited = false
      
      if (quizMode === 'superquest') {
        // SuperQuest: 70 questões, baseId=3, sem outros filtros
        finalTopicIds = []
        finalBaseIds = [3]
        finalQuestionCount = 70
        finalOnlyWrong = false
        finalOnlyMarked = false
      } else if (quizMode === 'review') {
        // Quest de Revisão: apenas questões erradas
        finalOnlyWrong = true
        finalOnlyMarked = false
      } else if (quizMode === 'inedited') {
        // Quest Inédito: apenas questões não respondidas
        inedited = true
        finalOnlyWrong = false
        finalOnlyMarked = false
      }
      
      const response = await apiClient.createQuiz(
        finalQuestionCount,
        finalTopicIds,
        finalBaseIds,
        feedbackMode,
        finalOnlyWrong,
        finalOnlyMarked,
        quizName || undefined,
        inedited // Adicionar parâmetro para questões inéditas
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
    setSelectedMatterIds([])
    setSelectedTopicIdsByMatter([])
    setExpandedSubjects([])
    setExpandedMatters([])
    setSelectedBaseIds([])
    setSearchTermBase('')
    setOnlyWrong(false)
    setOnlyMarked(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedOrigin !== 'aleatorias') count++
    if (selectedTypes.length > 0) count += selectedTypes.length
    if (selectedBonus.length > 0) count += selectedBonus.length
    if (selectedSubjectIds.length > 0) count += selectedSubjectIds.length
    if (selectedTopicIds.length > 0) count += selectedTopicIds.length
    if (selectedMatterIds.length > 0) count += selectedMatterIds.length
    if (selectedTopicIdsByMatter.length > 0) count += selectedTopicIdsByMatter.length
    if (selectedBaseIds.length > 0) count += selectedBaseIds.length
    if (statementText) count++
    if (onlyWrong) count++
    if (onlyMarked) count++
    return count
  }

  // Função para renderizar checkbox com estados
  const renderCheckbox = (isSelected?: boolean, isPartial?: boolean) => {
    if (isPartial) {
      return <MinusSquare className="w-5 h-5 text-[#eb1c2d]" />
    } else if (isSelected) {
      return <CheckSquare className="w-5 h-5 text-[#eb1c2d]" />
    } else {
      return <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
    }
  }

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <Breadcrumbs />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-12 h-12 animate-spin text-red-500" />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} userName={user?.name} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Quiz Config */}
            <div className="lg:col-span-2 space-y-6">
              {/* Nome do Quest e Configurações */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nome do Quest */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileQuestion className="w-5 h-5 text-blue-500" />
                        Nome do Quest
                      </h2>
                      <span title="Dê um nome para identificar seu quiz">
                        <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                      </span>
                    </div>
                    <input
                      type="text"
                      value={quizName}
                      onChange={(e) => setQuizName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Digite o nome do quiz..."
                    />
                  </div>
                  
                  {/* Quantidade de Questões */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Hash className="w-5 h-5 text-purple-500" />
                        Quantidade de Questoes
                      </h2>
                    </div>
                    <input
                      type="number"
                      value={questionCount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        if (value > 0 && value <= 300) {
                          setQuestionCount(value)
                        }
                      }}
                      min="1"
                      max="300"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Numero de questoes..."
                    />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('quizmode')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'quizmode'
                          ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Tipo de Quest
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('subjects')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'subjects'
                          ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={quizMode === 'superquest'}
                    >
                      <div className="flex items-center gap-2">
                        <Library className="w-4 h-4" />
                        Materias/Assuntos
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('matters')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'matters'
                          ? 'text-purple-600 border-purple-600 bg-purple-50/50'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={quizMode === 'superquest'}
                    >
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4" />
                        Temas/Assuntos
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('options')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'options'
                          ? 'text-red-600 border-red-600 bg-red-50/50'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={quizMode === 'superquest'}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Opcoes
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('base')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'base'
                          ? 'text-green-600 border-green-600 bg-green-50/50'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={quizMode === 'superquest'}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        BASE
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('statement')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'statement'
                          ? 'text-orange-600 border-orange-600 bg-orange-50/50'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={quizMode === 'superquest'}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Enunciado
                      </div>
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'quizmode' && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                          <Award className="w-5 h-5 text-indigo-500" />
                          Tipos de Quest
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Escolha o tipo de Quest que deseja realizar
                        </p>

                        {/* Quest Completo */}
                        <div className={`mb-4 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          quizMode === 'complete' 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-green-200 hover:shadow-sm'
                        }`}
                          onClick={() => setQuizMode('complete')}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              quizMode === 'complete'
                                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <CheckCircle2 className={`w-6 h-6 ${
                                quizMode === 'complete' ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg mb-2 ${
                                quizMode === 'complete' ? 'text-green-900' : 'text-gray-800'
                              }`}>
                                Quest Completo
                              </h4>
                              <p className={`text-sm ${
                                quizMode === 'complete' ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                Todas as questões disponíveis
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quest Inédito */}
                        <div className={`mb-4 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          quizMode === 'inedited' 
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                        }`}
                          onClick={() => setQuizMode('inedited')}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              quizMode === 'inedited'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <CircleDot className={`w-6 h-6 ${
                                quizMode === 'inedited' ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg mb-2 ${
                                quizMode === 'inedited' ? 'text-blue-900' : 'text-gray-800'
                              }`}>
                                Quest Inédito
                              </h4>
                              <p className={`text-sm ${
                                quizMode === 'inedited' ? 'text-blue-700' : 'text-gray-600'
                              }`}>
                                Apenas questões não respondidas
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quest de Revisão */}
                        <div className={`mb-4 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          quizMode === 'review' 
                            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm'
                        }`}
                          onClick={() => setQuizMode('review')}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              quizMode === 'review'
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <XCircle className={`w-6 h-6 ${
                                quizMode === 'review' ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg mb-2 ${
                                quizMode === 'review' ? 'text-orange-900' : 'text-gray-800'
                              }`}>
                                Quest de Revisão
                              </h4>
                              <p className={`text-sm ${
                                quizMode === 'review' ? 'text-orange-700' : 'text-gray-600'
                              }`}>
                                Questões que você errou ({wrongQuestionsCount} disponíveis)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* SuperQuest */}
                        <div className={`mb-4 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          quizMode === 'superquest' 
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm'
                        }`}
                          onClick={() => setQuizMode('superquest')}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              quizMode === 'superquest'
                                ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <Trophy className={`w-6 h-6 ${
                                quizMode === 'superquest' ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg mb-2 ${
                                quizMode === 'superquest' ? 'text-purple-900' : 'text-gray-800'
                              }`}>
                                SuperQuest
                              </h4>
                              <p className={`text-sm ${
                                quizMode === 'superquest' ? 'text-purple-700' : 'text-gray-600'
                              }`}>
                                70 questões de todo o conteúdo
                              </p>
                              {quizMode === 'superquest' && (
                                <p className="text-xs text-purple-600 mt-2">
                                  ⚠️ SuperQuest desabilita outros filtros
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'subjects' && (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Library className="w-5 h-5 text-blue-500" />
                            Matérias e Assuntos
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Selecione matérias completas ou assuntos específicos
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {subjects.filter(s => s.topics && s.topics.length > 0).length} matérias
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar matéria ou assunto..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-blue-600 font-medium">Matérias</p>
                                <p className="text-xl font-bold text-blue-900">
                                  {subjects.filter(s => s.topics && s.topics.length > 0 && (isAllTopicsSelected(s.id) || isPartiallySelected(s.id))).length}
                                </p>
                              </div>
                              <Folder className="w-8 h-8 text-blue-300" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-purple-600 font-medium">Assuntos</p>
                                <p className="text-xl font-bold text-purple-900">{selectedTopicIds.length}</p>
                              </div>
                              <FileText className="w-8 h-8 text-purple-300" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-green-600 font-medium">Questões</p>
                                <p className="text-xl font-bold text-green-900">
                                  {selectedTopicIds.length * 100}
                                </p>
                              </div>
                              <Target className="w-8 h-8 text-green-300" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                        {filteredSubjects.map((subject, index) => {
                          const subjectTopics = subject.topics || [];//topics[subject.id] || []
                          const selectedSubjectTopics = subjectTopics?.filter(t => selectedTopicIds.includes(t.id))
                          const isExpanded = expandedSubjects.includes(subject.id)
                          const isFullySelected = isAllTopicsSelected(subject.id)
                          const isPartial = isPartiallySelected(subject.id)

                          return (
                            <div 
                              key={subject.id}
                              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className={`p-4 transition-all duration-200 ${
                                isFullySelected ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 
                                isPartial ? 'bg-gradient-to-r from-blue-50/50 to-blue-100/50' : ''
                              }`}>
                                <div className="flex items-center gap-3">
                                  {/* Expand Button */}
                                  <button
                                    onClick={() => toggleSubject(subject.id)}
                                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-600" />
                                    )}
                                  </button>

                                  {/* Icon */}
                                  <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                                    isFullySelected || isPartial
                                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' 
                                      : 'bg-gray-100'
                                  }`}>
                                    {isExpanded ? (
                                      <FolderOpen className={`w-5 h-5 ${
                                        isFullySelected || isPartial ? 'text-white' : 'text-gray-600'
                                      }`} />
                                    ) : (
                                      <Folder className={`w-5 h-5 ${
                                        isFullySelected || isPartial ? 'text-white' : 'text-gray-600'
                                      }`} />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-sm text-gray-500">
                                        {selectedSubjectTopics?.length} de {subjectTopics?.length} assuntos selecionados
                                      </span>
                                      {isFullySelected && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                          Completa
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-3">
                                    {subjectTopics?.length > 0 && (
                                      <span className="text-sm text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full font-medium">
                                        {subjectTopics?.length} assuntos
                                      </span>
                                    )}
                                    
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        // if (!topics[subject.id]) {
                                        //   await fetchTopics(subject.id);
                                        // }
                                        toggleSubjectSelection(subject.id);
                                      }}
                                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      {renderCheckbox(isFullySelected, isPartial)}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Topics */}
                              {isExpanded && subjectTopics?.length > 0 && (
                                <div className="px-4 pb-4 bg-gradient-to-b from-gray-50 to-white">
                                  <div className="mt-3 ml-12 border-l-2 border-gray-200 pl-4">
                                    <p className="text-sm text-gray-600 mb-3 font-medium">Selecione os assuntos:</p>
                                    <div className="space-y-2">
                                      {subjectTopics?.map((topic, topicIndex) => (
                                        <label
                                          key={topic.id}
                                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                            selectedTopicIds.includes(topic.id)
                                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                                              : 'hover:bg-gray-50 border-transparent'
                                          }`}
                                          style={{ animationDelay: `${(index + topicIndex) * 30}ms` }}
                                        >
                                          <div className={`p-1.5 rounded-lg ${
                                            selectedTopicIds.includes(topic.id) 
                                              ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                                              : 'bg-gray-100'
                                          }`}>
                                            <FileText className={`w-4 h-4 ${
                                              selectedTopicIds.includes(topic.id) ? 'text-white' : 'text-gray-500'
                                            }`} />
                                          </div>
                                          <span className={`flex-1 text-sm ${
                                            selectedTopicIds.includes(topic.id) 
                                              ? 'text-gray-900 font-medium' 
                                              : 'text-gray-700'
                                          }`}>
                                            {topic.name}
                                          </span>
                                          <input
                                            type="checkbox"
                                            checked={selectedTopicIds.includes(topic.id)}
                                            onChange={() => toggleTopic(topic.id, subject.id)}
                                            className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                          />
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'matters' && (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FolderTree className="w-5 h-5 text-purple-500" />
                            Temas e Assuntos
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Organize suas questões por temas específicos
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {matters.filter(m => m.topics && m.topics.length > 0).length} temas
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={searchTermMatter}
                            onChange={(e) => setSearchTermMatter(e.target.value)}
                            placeholder="Buscar tema ou assunto..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                          {searchTermMatter && (
                            <button
                              onClick={() => setSearchTermMatter('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-purple-600 font-medium">Temas</p>
                                <p className="text-xl font-bold text-purple-900">
                                  {matters.filter(m => m.topics && m.topics.length > 0 && (isAllTopicsSelectedByMatter(m.id) || isPartiallySelectedByMatter(m.id))).length}
                                </p>
                              </div>
                              <FolderTree className="w-8 h-8 text-purple-300" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-xl border border-indigo-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-indigo-600 font-medium">Assuntos</p>
                                <p className="text-xl font-bold text-indigo-900">{selectedTopicIdsByMatter.length}</p>
                              </div>
                              <Tags className="w-8 h-8 text-indigo-300" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-xl border border-pink-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-pink-600 font-medium">Questões</p>
                                <p className="text-xl font-bold text-pink-900">
                                  {selectedTopicIdsByMatter.length * 75}
                                </p>
                              </div>
                              <Brain className="w-8 h-8 text-pink-300" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                        {filteredMatters.map((matter, index) => {
                          const matterTopics = matter.topics || []
                          const selectedMatterTopics = matterTopics?.filter(t => selectedTopicIdsByMatter.includes(t.id))
                          const isExpanded = expandedMatters.includes(matter.id)
                          const isFullySelected = isAllTopicsSelectedByMatter(matter.id)
                          const isPartial = isPartiallySelectedByMatter(matter.id)

                          return (
                            <div 
                              key={matter.id}
                              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className={`p-4 transition-all duration-200 ${
                                isFullySelected ? 'bg-gradient-to-r from-purple-50 to-purple-100' : 
                                isPartial ? 'bg-gradient-to-r from-purple-50/50 to-purple-100/50' : ''
                              }`}>
                                <div className="flex items-center gap-3">
                                  {/* Expand Button */}
                                  <button
                                    onClick={() => toggleMatter(matter.id)}
                                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-600" />
                                    )}
                                  </button>

                                  {/* Icon */}
                                  <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                                    isFullySelected || isPartial
                                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg' 
                                      : 'bg-gray-100'
                                  }`}>
                                    <ListTree className={`w-5 h-5 ${
                                      isFullySelected || isPartial ? 'text-white' : 'text-gray-600'
                                    }`} />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{matter.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-sm text-gray-500">
                                        {selectedMatterTopics?.length} de {matterTopics?.length} assuntos selecionados
                                      </span>
                                      {isFullySelected && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                          Completo
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-3">
                                    {matterTopics?.length > 0 && (
                                      <span className="text-sm text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full font-medium">
                                        {matterTopics?.length} assuntos
                                      </span>
                                    )}
                                    
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!topicsByMatter[matter.id]) {
                                          await fetchTopicsByMatter(matter.id);
                                        }
                                        toggleMatterSelection(matter.id);
                                      }}
                                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      {renderCheckbox(isFullySelected, isPartial)}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Topics */}
                              {isExpanded && matterTopics?.length > 0 && (
                                <div className="px-4 pb-4 bg-gradient-to-b from-gray-50 to-white">
                                  <div className="mt-3 ml-12 border-l-2 border-purple-200 pl-4">
                                    <p className="text-sm text-gray-600 mb-3 font-medium">Selecione os assuntos:</p>
                                    <div className="space-y-2">
                                      {matterTopics?.map((topic, topicIndex) => (
                                        <label
                                          key={topic.id}
                                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                            selectedTopicIdsByMatter.includes(topic.id)
                                              ? 'bg-purple-50 border-purple-200 shadow-sm'
                                              : 'hover:bg-gray-50 border-transparent'
                                          }`}
                                          style={{ animationDelay: `${(index + topicIndex) * 30}ms` }}
                                        >
                                          <div className={`p-1.5 rounded-lg ${
                                            selectedTopicIdsByMatter.includes(topic.id) 
                                              ? 'bg-gradient-to-br from-purple-400 to-purple-500' 
                                              : 'bg-gray-100'
                                          }`}>
                                            <FileText className={`w-4 h-4 ${
                                              selectedTopicIdsByMatter.includes(topic.id) ? 'text-white' : 'text-gray-500'
                                            }`} />
                                          </div>
                                          <span className={`flex-1 text-sm ${
                                            selectedTopicIdsByMatter.includes(topic.id) 
                                              ? 'text-gray-900 font-medium' 
                                              : 'text-gray-700'
                                          }`}>
                                            {topic.name}
                                          </span>
                                          <input
                                            type="checkbox"
                                            checked={selectedTopicIdsByMatter.includes(topic.id)}
                                            onChange={() => toggleTopicByMatter(topic.id, matter.id)}
                                            className="w-5 h-5 text-purple-500 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                                          />
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'options' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="mb-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">Modo de Feedback</h3>
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
                            <input
                              type="radio"
                              name="feedbackMode"
                              value="immediate"
                              checked={feedbackMode === 'immediate'}
                              onChange={() => setFeedbackMode('immediate')}
                              className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Feedback Imediato</div>
                              <p className="text-sm text-gray-500 mt-1">
                                Mostra a resposta correta imediatamente após o aluno responder cada questão.
                                Ideal para estudo e aprendizado.
                              </p>
                            </div>
                          </label>
                          
                          <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
                            <input
                              type="radio"
                              name="feedbackMode"
                              value="end"
                              checked={feedbackMode === 'end'}
                              onChange={() => setFeedbackMode('end')}
                              className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Feedback ao Final</div>
                              <p className="text-sm text-gray-500 mt-1">
                                Mostra todas as respostas apenas após o aluno finalizar o quiz completo.
                                Ideal para simulados e avaliações.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'base' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-medium text-gray-800">Bases de Questões</h3>
                        <span className="text-sm text-gray-500">
                          {selectedBaseIds.length} de {bases.length} selecionadas
                        </span>
                      </div>

                      {/* Search bar */}
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar bases..."
                          value={searchTermBase}
                          onChange={(e) => setSearchTermBase(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                        />
                      </div>

                      {/* Bases list */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {bases
                          .filter(base => 
                            base.name.toLowerCase().includes(searchTermBase.toLowerCase()) ||
                            (base.description && base.description.toLowerCase().includes(searchTermBase.toLowerCase()))
                          )
                          .map((base) => {
                            const isSelected = selectedBaseIds.includes(base.id)
                            
                            return (
                              <label
                                key={base.id}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                  isSelected
                                    ? 'bg-purple-50 border-purple-300 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedBaseIds(selectedBaseIds.filter(id => id !== base.id))
                                    } else {
                                      setSelectedBaseIds([...selectedBaseIds, base.id])
                                    }
                                  }}
                                  className="w-5 h-5 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <h4 className={`font-medium ${
                                    isSelected ? 'text-purple-900' : 'text-gray-700'
                                  }`}>
                                    {base.name}
                                  </h4>
                                  {base.description && (
                                    <p className={`text-sm mt-1 ${
                                      isSelected ? 'text-purple-700' : 'text-gray-500'
                                    }`}>
                                      {base.description}
                                    </p>
                                  )}
                                </div>
                                <Database className={`w-5 h-5 ${
                                  isSelected ? 'text-purple-600' : 'text-gray-400'
                                }`} />
                              </label>
                            )
                          })
                        }
                        
                        {bases.filter(base => 
                          base.name.toLowerCase().includes(searchTermBase.toLowerCase()) ||
                          (base.description && base.description.toLowerCase().includes(searchTermBase.toLowerCase()))
                        ).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            Nenhuma base encontrada
                          </div>
                        )}
                      </div>
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}

                  {false && (
                    <div className="space-y-6 animate-fade-in">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                          <Brain className="w-5 h-5 text-indigo-500" />
                          Revisão Inteligente
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Crie quizzes personalizados baseados no seu histórico de aprendizado
                        </p>

                        {/* Wrong Questions Option */}
                        <div className={`mb-4 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          onlyWrong 
                            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-red-200 hover:shadow-sm'
                        }`}
                          onClick={() => {
                            setOnlyWrong(!onlyWrong)
                            if (!onlyWrong) setOnlyMarked(false) // Only one can be active at a time
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              onlyWrong
                                ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <XCircle className={`w-6 h-6 ${
                                onlyWrong ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg mb-2 ${
                                onlyWrong ? 'text-red-900' : 'text-gray-800'
                              }`}>
                                Questões que Errei
                              </h4>
                              <p className={`text-sm ${
                                onlyWrong ? 'text-red-700' : 'text-gray-600'
                              }`}>
                                Revise questões que você errou em quizzes anteriores para fortalecer seus pontos fracos
                              </p>
                              <div className="mt-3 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Activity className={`w-4 h-4 ${
                                    onlyWrong ? 'text-red-600' : 'text-gray-400'
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    onlyWrong ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    {loadingReviewStats ? '...' : `${wrongQuestionsCount} questões disponíveis`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {onlyWrong ? (
                                <CheckSquare className="w-6 h-6 text-red-500" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Marked Questions Option */}
                        <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                          onlyMarked 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-yellow-200 hover:shadow-sm'
                        }`}
                          onClick={() => {
                            setOnlyMarked(!onlyMarked)
                            if (!onlyMarked) setOnlyWrong(false) // Only one can be active at a time
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              onlyMarked
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <Flag className={`w-6 h-6 ${
                                onlyMarked ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg mb-2 ${
                                onlyMarked ? 'text-yellow-900' : 'text-gray-800'
                              }`}>
                                Questões Marcadas para Revisão
                              </h4>
                              <p className={`text-sm ${
                                onlyMarked ? 'text-yellow-700' : 'text-gray-600'
                              }`}>
                                Pratique questões que você marcou para revisar posteriormente
                              </p>
                              <div className="mt-3 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Star className={`w-4 h-4 ${
                                    onlyMarked ? 'text-yellow-600' : 'text-gray-400'
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    onlyMarked ? 'text-yellow-600' : 'text-gray-500'
                                  }`}>
                                    {loadingReviewStats ? '...' : `${markedQuestionsCount} questões disponíveis`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {onlyMarked ? (
                                <CheckSquare className="w-6 h-6 text-yellow-500" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Info Box */}
                        {(onlyWrong || onlyMarked) && (
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-blue-800">
                                  <strong>Dica:</strong> Você ainda pode combinar com outros filtros como Matérias, Temas ou Bases 
                                  para refinar ainda mais suas questões de revisão.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Filtros Selecionados */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros Selecionados
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </button>
                </div>

                {/* Numero de questoes */}
                <div className="text-center mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <FileQuestion className="w-12 h-12 text-blue-600" />
                    <div className="text-5xl font-bold text-gray-800">
                      {loadingCount ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        totalQuestions.toLocaleString()
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {loadingCount ? 'calculando...' : 'questões disponíveis'}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <TrendingUp className={`w-4 h-4 text-orange-500 ${
                      getActiveFiltersCount() > 0 ? 'animate-bounce' : ''
                    }`} />
                    <p className="text-sm text-orange-600 font-medium">
                      {getActiveFiltersCount()} filtros ativos
                    </p>
                  </div>
                </div>

                {/* Selected Filters Display */}
                {getActiveFiltersCount() === 0 ? (
                  <div className="text-center py-8 border-t border-gray-200">
                    <p className="text-gray-500 text-sm">Nenhum filtro selecionado</p>
                    <p className="text-gray-400 text-xs mt-1">Questões aleatórias de todo o banco</p>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    {/* Aqui vão os filtros selecionados... */}
                  </div>
                )}
              </div>

              {/* Gerar Quest Button */}
              <button
                onClick={handleCreateQuiz}
                disabled={creating}
                className={`w-full py-5 px-8 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                  !creating
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transform hover:scale-[1.02]'
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
                    <Sparkles className="w-5 h-5" />
                    <span>Gerar Quest</span>
                    <Zap className="w-5 h-5" />
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