'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current <= 3) {
    pages.push(2, 3, 4, 'ellipsis', total)
  } else if (current >= total - 2) {
    pages.push('ellipsis', total - 3, total - 2, total - 1, total)
  } else {
    pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis', total)
  }

  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
      {/* Info text */}
      <p className="text-sm text-gray-500 order-2 sm:order-1" aria-live="polite">
        Mostrando{' '}
        <span className="font-semibold text-gray-700">{start}</span>
        {' '}&ndash;{' '}
        <span className="font-semibold text-gray-700">{end}</span>
        {' '}de{' '}
        <span className="font-semibold text-gray-700">{totalItems}</span>
        {' '}materiais
      </p>

      {/* Page controls */}
      <nav
        className="flex items-center gap-1 order-1 sm:order-2"
        aria-label="Navegacao entre paginas"
      >
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium
            text-gray-600 hover:text-gray-900 hover:bg-gray-100
            active:bg-gray-200
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors duration-150"
          aria-label="Pagina anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, idx) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }

          const isActive = page === currentPage

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isActive}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold
                focus:outline-none focus:ring-2 focus:ring-offset-1
                transition-colors duration-150
                ${
                  isActive
                    ? 'bg-gray-900 text-white focus:ring-gray-900 cursor-default'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400'
                }`}
              aria-label={`Pagina ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium
            text-gray-600 hover:text-gray-900 hover:bg-gray-100
            active:bg-gray-200
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors duration-150"
          aria-label="Proxima pagina"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  )
}
