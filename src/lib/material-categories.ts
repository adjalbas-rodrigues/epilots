export interface CategoryDefinition {
  key: string
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const CATEGORY_RULES: Array<{ pattern: RegExp; key: string; label: string }> = [
  { pattern: /^CBO-2025-Navegacao-Eletronica/i, key: 'nav-eletronica', label: 'Navegacao Eletronica' },
  { pattern: /^CBO-2025-Preparacao-e-Execucao/i, key: 'prep-derrota', label: 'Prep. e Exec. da Derrota' },
  { pattern: /^CBO-2025-Procedimentos-Administrativos/i, key: 'proc-admin', label: 'Proc. Administrativos' },
  { pattern: /^CBO-2025-Servico-de-Praticagem/i, key: 'serv-praticagem', label: 'Servico de Praticagem' },
  { pattern: /^CBO-2025-Navegacao/i, key: 'navegacao', label: 'Navegacao' },
  { pattern: /^CBO-2025-Meteorologia/i, key: 'meteorologia', label: 'Meteorologia' },
  { pattern: /^CBO-2025-Manobra/i, key: 'manobra', label: 'Manobra' },
  { pattern: /^CBO-2025-Marinharia/i, key: 'marinharia', label: 'Marinharia' },
  { pattern: /^CBO-2025-Rebocadores/i, key: 'rebocadores', label: 'Rebocadores' },
  { pattern: /^CBO-2025-Propulsao/i, key: 'propulsao', label: 'Propulsao' },
  { pattern: /^CBO-2025-Legislacao/i, key: 'legislacao', label: 'Legislacao' },
  { pattern: /^CBO-2025-RIPEAM/i, key: 'ripeam', label: 'RIPEAM' },
  { pattern: /^CBO-2025-Comunicacoes/i, key: 'comunicacoes', label: 'Comunicacoes' },
  { pattern: /^CBO-2025-Controlabilidade/i, key: 'controlabilidade', label: 'Controlabilidade' },
  { pattern: /^CBO-2025-Resistencia/i, key: 'resistencia', label: 'Resistencia' },
  { pattern: /^(ATUALIZAcaO|Atualizacao)/i, key: 'atualizacoes', label: 'Atualizacoes' },
  { pattern: /^C1[45]R/i, key: 'cadernos', label: 'Cadernos de Provas' },
  { pattern: /^SC-/i, key: 'simulados', label: 'Simulados' },
  { pattern: /^TEE-/i, key: 'tee', label: 'TEE (Testes)' },
  { pattern: /^MIG-/i, key: 'miguens', label: 'Miguens' },
  { pattern: /^PREP-/i, key: 'preparacao', label: 'Indices/Preparacao' },
]

const CATEGORY_STYLES: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  'navegacao':        { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'nav-eletronica':   { color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  'meteorologia':     { color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
  'manobra':          { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  'marinharia':       { color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  'rebocadores':      { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'propulsao':        { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  'legislacao':       { color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  'ripeam':           { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  'comunicacoes':     { color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  'controlabilidade': { color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-200' },
  'resistencia':      { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  'prep-derrota':     { color: 'text-lime-700', bgColor: 'bg-lime-50', borderColor: 'border-lime-200' },
  'serv-praticagem':  { color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  'proc-admin':       { color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  'atualizacoes':     { color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  'cadernos':         { color: 'text-stone-700', bgColor: 'bg-stone-50', borderColor: 'border-stone-200' },
  'simulados':        { color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  'tee':              { color: 'text-zinc-700', bgColor: 'bg-zinc-100', borderColor: 'border-zinc-200' },
  'miguens':          { color: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  'preparacao':       { color: 'text-neutral-700', bgColor: 'bg-neutral-50', borderColor: 'border-neutral-200' },
  'outros':           { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
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
