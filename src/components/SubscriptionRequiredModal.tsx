'use client'

import Link from 'next/link'
import { Lock, Sparkles, X, ArrowRight, FileQuestion, BookOpen, Video } from 'lucide-react'

type Reason = 'SUBSCRIPTION_REQUIRED' | 'FEATURE_NOT_IN_PLAN'

interface Props {
  open: boolean
  onClose: () => void
  reason: Reason
  currentPlan?: string
  feature?: string
}

const FEATURE_LABELS: Record<string, { label: string; icon: any }> = {
  access_questions: { label: 'questões e simulados', icon: FileQuestion },
  access_courses:   { label: 'curso de exercícios',  icon: BookOpen },
  access_videos:    { label: 'aulas em vídeo',       icon: Video }
}

export default function SubscriptionRequiredModal({
  open, onClose, reason, currentPlan, feature
}: Props) {
  if (!open) return null

  const isUpgrade = reason === 'FEATURE_NOT_IN_PLAN'
  const featureInfo = feature ? FEATURE_LABELS[feature] : null
  const FeatureIcon = featureInfo?.icon || Lock

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 px-6 pt-8 pb-12 text-white text-center">
          <button onClick={onClose} aria-label="Fechar"
            className="absolute top-3 right-3 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            {isUpgrade
              ? <Sparkles className="w-8 h-8 text-white" />
              : <Lock className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isUpgrade ? 'Faça upgrade do seu plano' : 'Assinatura ativa necessária'}
          </h2>
          <p className="text-white/90 text-sm">
            {isUpgrade
              ? `Seu plano atual não inclui ${featureInfo?.label || 'esse recurso'}.`
              : 'Para acessar este conteúdo, você precisa de uma assinatura ativa.'}
          </p>
        </div>

        <div className="p-6 -mt-6">
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                <FeatureIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-sm">
                {isUpgrade ? (
                  <>
                    <p className="font-semibold text-gray-900 mb-1">
                      Desbloqueie {featureInfo?.label || 'todos os recursos'}
                    </p>
                    <p className="text-gray-600">
                      Faça upgrade pra um plano superior e tenha acesso completo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 mb-1">Acesso premium</p>
                    <p className="text-gray-600">
                      Escolha um dos 3 planos: Questões, Completo ou Premium. Cancele quando quiser.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/pricing"
            className="block w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-center font-bold rounded-full hover:from-red-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isUpgrade ? 'Fazer upgrade' : 'Ver planos'}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={onClose}
            className="block w-full mt-2 py-3 text-gray-500 hover:text-gray-700 text-sm"
          >
            Agora não
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scale-in { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.25s ease-out; }
      `}</style>
    </div>
  )
}
