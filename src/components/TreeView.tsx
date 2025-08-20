'use client'

import React from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText,
  CheckSquare,
  Square,
  MinusSquare
} from 'lucide-react'

interface TreeNode {
  id: number
  name: string
  count?: number
  children?: TreeNode[]
  icon?: React.ReactNode
  color?: string
}

interface TreeViewProps {
  nodes: TreeNode[]
  selectedIds: number[]
  expandedIds: number[]
  onToggleExpand: (id: number) => void
  onToggleSelect: (id: number, isParent: boolean) => void
  onToggleSelectAll?: (id: number) => void
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange'
  showCounts?: boolean
  animated?: boolean
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconBg: 'bg-blue-500',
    iconText: 'text-white',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:bg-blue-100',
    selected: 'bg-blue-100 border-blue-300',
    childSelected: 'bg-blue-50 border border-blue-200'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    iconBg: 'bg-purple-500',
    iconText: 'text-white',
    badge: 'bg-purple-100 text-purple-700',
    hover: 'hover:bg-purple-100',
    selected: 'bg-purple-100 border-purple-300',
    childSelected: 'bg-purple-50 border border-purple-200'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    iconBg: 'bg-green-500',
    iconText: 'text-white',
    badge: 'bg-green-100 text-green-700',
    hover: 'hover:bg-green-100',
    selected: 'bg-green-100 border-green-300',
    childSelected: 'bg-green-50 border border-green-200'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    iconBg: 'bg-orange-500',
    iconText: 'text-white',
    badge: 'bg-orange-100 text-orange-700',
    hover: 'hover:bg-orange-100',
    selected: 'bg-orange-100 border-orange-300',
    childSelected: 'bg-orange-50 border border-orange-200'
  }
}

export default function TreeView({
  nodes,
  selectedIds,
  expandedIds,
  onToggleExpand,
  onToggleSelect,
  onToggleSelectAll,
  colorScheme = 'blue',
  showCounts = true,
  animated = true
}: TreeViewProps) {
  const colors = colorSchemes[colorScheme]

  const isNodeSelected = (node: TreeNode): boolean => {
    if (selectedIds.includes(node.id)) return true
    if (node.children) {
      return node.children.every(child => isNodeSelected(child))
    }
    return false
  }

  const isNodePartiallySelected = (node: TreeNode): boolean => {
    if (!node.children) return false
    const selectedChildren = node.children.filter(child => isNodeSelected(child))
    return selectedChildren.length > 0 && selectedChildren.length < node.children.length
  }

  const getSelectedChildrenCount = (node: TreeNode): number => {
    if (!node.children) return 0
    return node.children.filter(child => isNodeSelected(child)).length
  }

  const renderCheckbox = (node: TreeNode, isParent: boolean) => {
    const isSelected = isNodeSelected(node)
    const isPartial = isNodePartiallySelected(node)

    if (isPartial) {
      return <MinusSquare className="w-5 h-5 text-[#eb1c2d]" />
    } else if (isSelected) {
      return <CheckSquare className="w-5 h-5 text-[#eb1c2d]" />
    } else {
      return <Square className="w-5 h-5 text-gray-400" />
    }
  }

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedIds.includes(node.id)
    const isSelected = isNodeSelected(node)
    const isPartial = isNodePartiallySelected(node)
    const hasChildren = node.children && node.children.length > 0
    const selectedCount = getSelectedChildrenCount(node)

    return (
      <div 
        key={node.id} 
        className={`${animated ? 'animate-fade-in' : ''}`}
        style={{ animationDelay: `${level * 50}ms` }}
      >
        <div 
          className={`
            group relative rounded-lg transition-all duration-200
            ${isSelected ? colors.selected : ''}
            ${!isSelected && hasChildren ? colors.hover : ''}
            ${level === 0 ? 'mb-2' : 'mb-1'}
          `}
        >
          <div className="flex items-center p-3">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => onToggleExpand(node.id)}
                className="mr-2 p-1 rounded hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-8" />}

            {/* Icon */}
            <div className={`
              mr-3 p-2 rounded-lg transition-all duration-200
              ${isSelected || isPartial ? colors.iconBg : 'bg-gray-100'}
            `}>
              {node.icon || (
                hasChildren ? (
                  isExpanded ? (
                    <FolderOpen className={`w-5 h-5 ${isSelected || isPartial ? colors.iconText : 'text-gray-600'}`} />
                  ) : (
                    <Folder className={`w-5 h-5 ${isSelected || isPartial ? colors.iconText : 'text-gray-600'}`} />
                  )
                ) : (
                  <FileText className={`w-5 h-5 ${isSelected ? colors.iconText : 'text-gray-600'}`} />
                )
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isSelected || isPartial ? 'text-gray-900' : 'text-gray-700'}`}>
                  {node.name}
                </span>
                {hasChildren && showCounts && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {selectedCount}/{node.children?.length || 0}
                  </span>
                )}
              </div>
              {hasChildren && node.children && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCount} de {node.children.length} selecionados
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {hasChildren && node.count && (
                <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  {node.count} questões
                </span>
              )}
              
              {/* Checkbox */}
              <button
                onClick={() => {
                  if (hasChildren && onToggleSelectAll) {
                    onToggleSelectAll(node.id)
                  } else {
                    onToggleSelect(node.id, hasChildren || false)
                  }
                }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                {renderCheckbox(node, hasChildren || false)}
              </button>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className={`ml-6 pl-4 border-l-2 ${colors.border} ${animated ? 'animate-slide-down' : ''}`}>
            <div className="py-2">
              {node.children?.map(child => renderNode(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {nodes.map(node => renderNode(node))}
    </div>
  )
}