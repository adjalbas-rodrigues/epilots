'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'
import VdoCipherPlayerFinal from '@/components/VdoCipherPlayerFinal'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api'
import { 
  Play,
  Clock,
  Calendar,
  BookOpen,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Eye,
  Star,
  MessageSquare,
  User,
  Loader2,
  Video,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Heart,
  Bookmark,
  MoreVertical,
  X
} from 'lucide-react'

interface VideoData {
  id: number
  id_video: string
  title: string
  thumbnail?: string
  file_date_add: string
  matterId: number
  viewCount?: number
  isLiked?: boolean
  isBookmarked?: boolean
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

interface Progress {
  totalVideos: number
  watchedVideos: number
  percentage: number
}

interface Comment {
  id: number
  comment: string
  created_at: string
  student: {
    id: number
    name: string
  }
  replies?: Comment[]
}

interface RelatedVideo {
  id: number
  title: string
  thumbnail?: string
  file_date_add: string
  matter?: {
    id: number
    name: string
  }
}

export default function VideoLessonPage() {
  const router = useRouter()
  const params = useParams()
  const videoId = params?.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { showToast } = useToast()

  const [video, setVideo] = useState<VideoData | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([])
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login')
    } else if (isAuthenticated && videoId) {
      fetchVideo()
      fetchComments()
    }
  }, [isAuthenticated, authLoading, router, videoId])

  const fetchVideo = async (id?: string) => {
    const targetId = id || videoId
    try {
      setLoading(true)
      const response = await apiClient.request(`/videos/lessons/${targetId}`)
      
      if (response.status === 'success') {
        setVideo(response.data.video)
        setRelatedVideos(response.data.relatedVideos || [])
        setProgress(response.data.progress)
        setLiked(response.data.video.isLiked || false)
        setBookmarked(response.data.video.isBookmarked || false)
        // Reset comments when changing video
        setComments([])
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      showToast('Erro ao carregar vídeo', 'error')
      router.push('/lessons')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Data não disponível'
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return 'Data não disponível'
    }
  }

  const handleLike = async () => {
    try {
      const response = await apiClient.request(`/videos/lessons/${videoId}/like`, {
        method: 'POST'
      })
      
      if (response.status === 'success') {
        setLiked(response.liked)
        showToast(response?.message || 'Vídeo curtido!', 'success')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      showToast('Erro ao curtir vídeo', 'error')
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await apiClient.request(`/videos/lessons/${videoId}/bookmark`, {
        method: 'POST'
      })
      
      if (response.status === 'success') {
        setBookmarked(response.bookmarked)
        showToast(response?.message || 'Vídeo marcado', 'success')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      showToast('Erro ao favoritar vídeo', 'error')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: `Confira esta aula: ${video?.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Link copiado para a área de transferência!', 'success')
    }
  }

  const handleRelatedVideoClick = (id: number) => {
    // Update URL without full navigation
    window.history.pushState({}, '', `/lessons/${id}`)
    // Fetch new video data
    fetchVideo(id.toString())
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fetchComments = async () => {
    try {
      setLoadingComments(true)
      const response = await apiClient.request(`/videos/lessons/${videoId}/comments`)
      
      if (response.status === 'success') {
        setComments(response.data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    
    try {
      setSubmittingComment(true)
      const response = await apiClient.request(`/videos/lessons/${videoId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: newComment })
      })
      
      if (response.status === 'success') {
        setComments([response.data, ...comments])
        setNewComment('')
        showToast('Comentário adicionado!', 'success')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      showToast('Erro ao adicionar comentário', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim()) return
    
    try {
      setSubmittingComment(true)
      const response = await apiClient.request(`/videos/lessons/${videoId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: replyText, parent_id: parentId })
      })
      
      if (response.status === 'success') {
        // Update the parent comment with the new reply
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data]
            }
          }
          return comment
        }))
        setReplyText('')
        setReplyingTo(null)
        showToast('Resposta adicionada!', 'success')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      showToast('Erro ao adicionar resposta', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await apiClient.request(`/videos/lessons/${videoId}/comments/${commentId}`, {
        method: 'DELETE'
      })
      
      if (response.status === 'success') {
        setComments(comments.filter(c => c.id !== commentId))
        showToast('Comentário removido', 'success')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      showToast('Erro ao remover comentário', 'error')
    }
  }

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
    
    return date.toLocaleDateString('pt-BR')
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <Breadcrumbs />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">Carregando aula...</p>
          </div>
        </div>
      </>
    )
  }

  if (!video) {
    return (
      <>
        <Navbar isAuthenticated={true} userName={user?.name} />
        <Breadcrumbs />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
          <div className="text-center">
            <Video className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Vídeo não encontrado</h3>
            <button
              onClick={() => router.push('/lessons')}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Voltar para Aulas
            </button>
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
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/lessons')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Aulas</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Video Player Container */}
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-6 animate-fadeIn">
                <VdoCipherPlayerFinal
                  videoId={video.id_video}
                  title={video.title}
                  description={`Aula de ${video.matter?.name || 'Conteúdo'}`}
                  teacherName="Elite"
                  thumbnail={video.thumbnail}
                />
              </div>

              {/* Video Info */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6 animate-slideUp">
                <h1 className="text-2xl font-bold text-white mb-4 line-clamp-2">
                  {video.title}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  {video.matter && (
                    <>
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${video.matter.subject?.color}30`,
                          color: video.matter.subject?.color || '#fff'
                        }}
                      >
                        {video.matter.subject?.name}
                      </span>
                      <span className="text-gray-400">
                        {video.matter.name}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div className="flex items-center gap-6 text-gray-400 text-sm">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {video.viewCount || 0} visualizações
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(video.file_date_add)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-lg transition-all ${
                        liked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleBookmark}
                      className={`p-3 rounded-lg transition-all ${
                        bookmarked 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="p-3 bg-white/10 text-gray-400 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-slideUp delay-100">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-red-500" />
                  Sobre esta Aula
                </h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    Esta aula aborda os conceitos fundamentais de {video.matter?.name || 'conteúdo especializado'}, 
                    fornecendo uma base sólida para seu aprendizado. Acompanhe com atenção e não hesite em 
                    revisar o conteúdo quantas vezes necessário.
                  </p>
                  
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-400" />
                      Dicas de Estudo
                    </h3>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Faça anotações dos pontos principais</li>
                      <li>• Pause o vídeo para resolver exercícios</li>
                      <li>• Revise o conteúdo regularmente</li>
                      <li>• Pratique com questões relacionadas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mt-6 animate-slideUp delay-200">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  Comentários
                  {comments.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">({comments.length})</span>
                  )}
                </h2>
                
                {/* Add Comment Form */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setNewComment('')}
                          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                          disabled={!newComment.trim() || submittingComment}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || submittingComment}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submittingComment && <Loader2 className="w-4 h-4 animate-spin" />}
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-2" />
                    <p className="text-gray-400">Carregando comentários...</p>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="group">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {comment.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-700/30 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <span className="text-white font-medium text-sm">
                                    {comment.student.name}
                                  </span>
                                  <span className="text-gray-500 text-xs ml-2">
                                    {formatCommentDate(comment.created_at)}
                                  </span>
                                </div>
                                {comment.student.id === user?.id && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm">
                                {comment.comment}
                              </p>
                              <button
                                onClick={() => setReplyingTo(comment.id)}
                                className="text-gray-500 hover:text-red-400 text-xs mt-2 transition-colors"
                              >
                                Responder
                              </button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                              <div className="mt-3 ml-8">
                                <div className="flex gap-2">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Digite sua resposta..."
                                    className="flex-1 p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none text-sm"
                                    rows={2}
                                  />
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setReplyingTo(null)
                                      setReplyText('')
                                    }}
                                    className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleSubmitReply(comment.id)}
                                    disabled={!replyText.trim() || submittingComment}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                                  >
                                    Responder
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 ml-8 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-bold text-xs">
                                        {reply.student.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 bg-gray-700/20 rounded-lg p-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium text-xs">
                                          {reply.student.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                          {formatCommentDate(reply.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-gray-300 text-xs">
                                        {reply.comment}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Seja o primeiro a comentar!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-6 animate-slideLeft relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Seu Progresso
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-white mb-2">
                        <span className="text-sm opacity-90">Aulas Assistidas</span>
                        <span className="font-bold text-2xl">{progress?.watchedVideos || 0}/{progress?.totalVideos || 0}</span>
                      </div>
                      <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress?.percentage || 0}%` }} />
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-white/20">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm opacity-90">Taxa de Conclusão</span>
                        <span className="font-bold text-2xl">{progress?.percentage || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Videos */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-slideLeft delay-100">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" />
                  Aulas Relacionadas
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {relatedVideos.length > 0 ? (
                    relatedVideos.map((relatedVideo, index) => (
                      <div
                        key={relatedVideo.id}
                        onClick={() => handleRelatedVideoClick(relatedVideo.id)}
                        className="group cursor-pointer p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-12 rounded-lg flex-shrink-0 overflow-hidden relative bg-gradient-to-br from-gray-700 to-gray-900">
                            {relatedVideo.thumbnail ? (
                              <img 
                                src={relatedVideo.thumbnail} 
                                alt={relatedVideo.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 flex items-center justify-center ${relatedVideo.thumbnail ? 'hidden' : ''}`}>
                              <Play className="w-6 h-6 text-white/60" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-400 transition-colors">
                              {relatedVideo.title}
                            </h4>
                            <p className="text-gray-500 text-xs mt-1">
                              {relatedVideo.matter?.name || 'Conteúdo Geral'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      Nenhuma aula relacionada encontrada
                    </p>
                  )}
                </div>

                {relatedVideos.length > 0 && (
                  <button
                    onClick={() => router.push('/lessons')}
                    className="w-full mt-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Ver Todas as Aulas
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Achievement Card */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 mt-6 animate-slideLeft delay-200">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h3 className="text-white font-bold">Continue Assim!</h3>
                    <p className="text-gray-400 text-sm">Você está no caminho certo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= 3 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-400 text-xs mt-2">
                  Complete mais 2 aulas para subir de nível!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-slideLeft {
          animation: slideLeft 0.6s ease-out;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </>
  )
}