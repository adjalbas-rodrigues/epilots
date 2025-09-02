import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ReportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: number;
  questionId: number;
  questionStatement: string;
}

export default function ReportErrorModal({
  isOpen,
  onClose,
  quizId,
  questionId,
  questionStatement
}: ReportErrorModalProps) {
  const [errorDescription, setErrorDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!errorDescription.trim()) {
      alert('Por favor, descreva o erro encontrado');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await apiClient.reportQuestionError(quizId, questionId, errorDescription);
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setErrorDescription('');
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Erro ao reportar:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove HTML tags and decode HTML entities for display
  const cleanStatement = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500 w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-900">Reportar Erro na Questão</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Questão:</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 line-clamp-3">{cleanStatement(questionStatement)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="errorDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Descreva o erro encontrado:
            </label>
            <textarea
              id="errorDescription"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Ex: A resposta correta está marcada incorretamente, há um erro de digitação na pergunta, etc."
              value={errorDescription}
              onChange={(e) => setErrorDescription(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
              Erro reportado com sucesso! Obrigado pelo feedback.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              Ocorreu um erro ao enviar o relatório. Por favor, tente novamente.
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={isSubmitting || submitStatus === 'success'}
            >
              <Send size={16} />
              {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}