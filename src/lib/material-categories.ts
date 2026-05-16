interface CategoryMeta {
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const CATEGORIES: Record<string, CategoryMeta> = {
  'atualizacoes': { label: 'Atualizações', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'simulados':    { label: 'Simulado',     color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'cadernos':     { label: 'Caderno de Questões', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'cbo':          { label: 'CBO',          color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  'outros':       { label: 'Outros',       color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
}

const FALLBACK: CategoryMeta = CATEGORIES['outros']

export function getCategoryLabel(key: string): string {
  return CATEGORIES[key]?.label || key
}

export function getCategoryStyle(key: string) {
  return CATEGORIES[key] || FALLBACK
}

export function getAllCategories(): Array<{ key: string; label: string }> {
  return Object.entries(CATEGORIES).map(([key, meta]) => ({ key, label: meta.label }))
}
