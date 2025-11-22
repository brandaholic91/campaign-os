'use client'

import React from 'react'

interface CheckboxItemProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onChange: (id: string) => void
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ id, label, description, checked, onChange }) => (
  <div 
    onClick={() => onChange(id)}
    className={`
      relative flex items-start space-x-3 p-3 rounded-lg cursor-pointer border transition-all duration-200
      ${checked 
        ? 'bg-primary-50 border-primary-200 shadow-sm' 
        : 'bg-white border-gray-200 hover:border-primary-200 hover:bg-gray-50'
      }
    `}
  >
    <div className="flex-shrink-0 mt-0.5">
      <div className={`
        w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center
        ${checked ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}
      `}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium transition-colors ${checked ? 'text-primary-900' : 'text-gray-700'}`}>
        {label}
      </p>
      {description && (
        <p className={`text-xs mt-0.5 leading-relaxed ${checked ? 'text-primary-700/80' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  </div>
)

interface CheckboxListProps {
  title: string
  count: number
  items: { id: string; name: string; subtitle?: string; description?: string; selected: boolean }[]
  onToggle: (id: string) => void
}

export const CheckboxList: React.FC<CheckboxListProps> = ({ title, count, items, onToggle }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold font-display text-gray-900 uppercase tracking-wider">
          {title}
        </h3>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
          {count} / {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-1 -mr-1">
        {items.map(item => (
          <CheckboxItem
            key={item.id}
            id={item.id}
            label={item.name}
            description={item.subtitle || item.description}
            checked={item.selected}
            onChange={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
