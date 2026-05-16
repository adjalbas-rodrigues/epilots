'use client'

import { Eye, Download, Loader2, FileText } from 'lucide-react'
import type { Material } from '@/hooks/useMaterials'
import { getCategoryLabel, getCategoryStyle } from '@/lib/material-categories'

interface MaterialRowProps {
  material: Material
  index: number
  isDownloading: boolean
  onView: (material: Material) => void
  onDownload: (material: Material) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MaterialRow({
  material,
  index,
  isDownloading,
  onView,
  onDownload,
}: MaterialRowProps) {
  const catStyle = getCategoryStyle(material.category)

  return (
    <tr
      className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors duration-150"
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: 'both',
      }}
    >
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-950">
              {material.title}
            </p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${catStyle.bgColor} ${catStyle.color} ${catStyle.borderColor}`}
              >
                {getCategoryLabel(material.category)}
              </span>
              {/* Mobile-only meta */}
              <span className="text-xs text-gray-400 sm:hidden">
                {formatFileSize(material.file_size)}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* File size — hidden on mobile */}
      <td className="hidden sm:table-cell px-4 py-3 sm:px-6 sm:py-4 text-right">
        <span className="text-sm text-gray-500 font-medium tabular-nums">
          {formatFileSize(material.file_size)}
        </span>
      </td>

      {/* Downloads — hidden on mobile */}
      <td className="hidden md:table-cell px-4 py-3 sm:px-6 sm:py-4 text-right">
        <span className="text-sm text-gray-500 tabular-nums">
          {material.download_count != null && material.download_count > 0
            ? material.download_count
            : '—'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(material)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg
              text-gray-700 bg-white border border-gray-200
              hover:bg-gray-50 hover:border-gray-300
              active:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
              transition-colors duration-150"
            aria-label={`Visualizar ${material.title}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visualizar</span>
          </button>

          <button
            onClick={() => onDownload(material)}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg
              text-white bg-gray-900
              hover:bg-gray-800
              active:bg-gray-950
              focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150"
            aria-label={`Baixar ${material.title}`}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? 'Baixando...' : 'Baixar'}
            </span>
          </button>
        </div>
      </td>
    </tr>
  )
}
