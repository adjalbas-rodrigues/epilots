'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  Play, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Star,
  ChevronRight,
  Loader2,
  Grid3X3,
  List,
  X,
  Calendar,
  Eye,
  Sparkles,
  Zap,
  Award,
  PlayCircle,
  Video,
  ArrowRight
} from 'lucide-react'
import Image from 'next/image'

interface Video {
  id: number
  id_video: string
  title: string
  thumbnail?: string
  file_date_add: string
  created_at: string
  matterId: number
  viewCount?: number
  matter?: {
    id: number
    name: string
    subject?: {
      id: number
      name: string
      color: string
    }
  }
}

interface Matter {
  id: number
  name: string
  subject?: {
    id: number
    name: string
    color: string
  }
}

export default function VideoLessonsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { showToast } = useToast()

  const [videos, setVideos] = useState<Video[]>([])
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedMatter, setSelectedMatter] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login')
    } else if (isAuthenticated) {
      fetchVideos()
      fetchFeaturedVideos()
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos()
    }
  }, [currentPage, selectedMatter, searchTerm])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedMatter) params.append('matterId', selectedMatter.toString())
      
      const response = await apiClient.request(`/videos/lessons/all?${params}`)
      
      if (response.status === 'success') {
        setVideos(response.data.videos || [])
        setMatters(response.data.matters || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
        setTotalVideos(response.data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      // Não mostrar erro, apenas setar arrays vazios
      setVideos([])
      setMatters([])
      setTotalPages(1)
      setTotalVideos(0)
    } finally {
      setLoadingVideos(false)
      setLoading(false)
    }
  }

  const fetchFeaturedVideos = async () => {
    try {
      const response = await apiClient.request('/videos/lessons/featured')
      
      if (response.status === 'success') {
        setFeaturedVideos(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching featured videos:', error)
      setFeaturedVideos([])
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recente'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recente'
    
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 1) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`
    return `${Math.floor(diffDays / 365)} anos atrás`
  }

  const handleVideoClick = (videoId: number) => {
    router.push(`/lessons/${videoId}`)
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <Breadcrumbs />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">Carregando aulas...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar isAuthenticated={true} userName={user?.name} />
      <Breadcrumbs />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent" />
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 font-medium mb-6 animate-fadeIn">
                <Sparkles className="w-4 h-4" />
                <span>Aulas em Vídeo Premium</span>
                <Sparkles className="w-4 h-4" />
              </div>
              
              <h1 className="text-6xl font-bold text-white mb-4 animate-slideUp">
                Centro de
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> Aprendizado</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-slideUp delay-100">
                Domine os conteúdos com nossas aulas em vídeo de alta qualidade, 
                ministradas pelos melhores professores
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar aulas..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              </div>

              {/* Filter Dropdown */}
              {showFilters && (
                <div className="mt-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl animate-slideDown">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Filtrar por Matéria</h3>
                    <button
                      onClick={() => {
                        setSelectedMatter(null)
                        setShowFilters(false)
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {matters.map((matter) => (
                      <button
                        key={matter.id}
                        onClick={() => {
                          setSelectedMatter(matter.id === selectedMatter ? null : matter.id)
                          setCurrentPage(1)
                        }}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          selectedMatter === matter.id
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {matter.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between max-w-4xl mx-auto mb-8">
              <div className="text-white">
                <span className="text-2xl font-bold">{totalVideos}</span>
                <span className="text-gray-400 ml-2">aulas disponíveis</span>
              </div>
              
              <div className="flex items-center gap-2 p-1 bg-white/10 backdrop-blur-sm rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Videos Carousel */}
        {featuredVideos.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  <TrendingUp className="inline-block w-8 h-8 text-red-500 mr-2" />
                  Aulas em Destaque
                </h2>
                <p className="text-gray-400">As aulas mais recentes e populares</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.slice(0, 3).map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video.id)}
                  className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  
                  <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                    <div className="relative h-48 bg-gradient-to-br from-red-600 to-orange-600 overflow-hidden">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          DESTAQUE
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h3>
                      
                      {video.matter && (
                        <div className="flex items-center gap-2 mb-4">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${video.matter.subject?.color}20`,
                              color: video.matter.subject?.color
                            }}
                          >
                            {video.matter.name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-gray-400 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.viewCount || 0} visualizações
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(video.file_date_add || video.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Video Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              <BookOpen className="inline-block w-8 h-8 text-red-500 mr-2" />
              Todas as Aulas
            </h2>
          </div>

          <div className="relative">
            {loadingVideos && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            )}
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video.id)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all">
                    <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      {video.matter && (
                        <div className="absolute top-3 left-3">
                          <span 
                            className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm"
                            style={{
                              backgroundColor: `${video.matter.subject?.color}40`,
                              color: 'white'
                            }}
                          >
                            {video.matter.subject?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h3>
                      
                      {video.matter && (
                        <p className="text-gray-400 text-sm mb-3">
                          {video.matter.name}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(video.file_date_add || video.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video.id)}
                  className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-red-500/50 transition-all animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <div className="relative w-48 h-28 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 mb-2">
                        {video.matter && (
                          <>
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${video.matter.subject?.color}20`,
                                color: video.matter.subject?.color
                              }}
                            >
                              {video.matter.subject?.name}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {video.matter.name}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-gray-500 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(video.file_date_add || video.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.viewCount || 0} visualizações
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage + i - 2
                  if (page > totalPages) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        currentPage === page
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Próximo
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {videos.length === 0 && !loading && (
          <div className="container mx-auto px-4 py-20">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <Video className="w-24 h-24 text-gray-500 mx-auto" />
                <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                {searchTerm || selectedMatter ? 'Nenhuma aula encontrada' : 'Em Breve: Video Aulas Premium'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || selectedMatter 
                  ? 'Tente ajustar os filtros ou buscar por outro termo' 
                  : 'Estamos preparando conteúdo exclusivo em vídeo para elevar seu aprendizado ao próximo nível!'}
              </p>
              {(searchTerm || selectedMatter) ? (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSearchInput('')
                    setSelectedMatter(null)
                    setCurrentPage(1)
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpar Filtros
                </button>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <div className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold shadow-lg">
                    <Clock className="inline-block w-5 h-5 mr-2" />
                    Aguarde Novidades
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}