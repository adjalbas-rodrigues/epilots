export interface CategoryDefinition {
  key: string
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const CATEGORY_RULES: Array<{ pattern: RegExp; key: string; label: string }> = [
  { pattern: /^(Atualizacao|MIG-)/i, key: 'atualizacoes', label: 'Atualizações' },
  { pattern: /^SC-/i, key: 'simulados', label: 'Simulado' },
  { pattern: /^C1[0-9]R/i, key: 'cadernos', label: 'Caderno de Questões' },
  { pattern: /^CBO-/i, key: 'cbo', label: 'CBO' },
]

const CATEGORY_STYLES: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  'atualizacoes': { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'simulados':    { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'cadernos':     { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'cbo':          { color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  'outros':       { color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
}

export function extractCategory(fileName: string): CategoryDefinition {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(fileName)) {
      const styles = CATEGORY_STYLES[rule.key] || CATEGORY_STYLES['outros']
      return { key: rule.key, label: rule.label, ...styles }
    }
  }
  return { key: 'outros', label: 'Outros', ...CATEGORY_STYLES['outros'] }
}

export function getAllCategoryLabels(): Array<{ key: string; label: string }> {
  const categories = CATEGORY_RULES.map(r => ({ key: r.key, label: r.label }))
  categories.push({ key: 'outros', label: 'Outros' })
  return categories
}

export function getCategoryStyle(key: string) {
  return CATEGORY_STYLES[key] || CATEGORY_STYLES['outros']
}
