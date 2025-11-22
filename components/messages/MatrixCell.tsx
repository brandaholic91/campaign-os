'use client'

import React, { useState } from 'react'
import { Database } from '@/lib/supabase/types'

type Message = Database['campaign_os']['Tables']['messages']['Row']

interface MatrixCellProps {
  message?: Message
  isLoading?: boolean
  onClick?: () => void
}

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const styles: Record<string, string> = {
    core: 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10',
    supporting: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10',
    cta: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10',
  }

  const labels: Record<string, string> = {
    core: 'Core Message',
    supporting: 'Supporting',
    cta: 'Call to Action',
  }

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide border ring-1 ring-inset
      ${styles[type] || 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10'}
    `}>
      {labels[type] || type}
    </span>
  )
}

export const MatrixCell: React.FC<MatrixCellProps> = ({ message, isLoading, onClick }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (message) {
      const text = `${message.headline}\n\n${message.body}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full min-h-[200px] p-5 bg-gray-50/30 flex flex-col gap-4 border-r border-b border-gray-100 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-100 rounded-full w-16 ml-auto"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          <div className="h-3 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  if (!message) {
    return (
      <div 
        className="h-full min-h-[200px] p-6 flex flex-col items-center justify-center border-r border-b border-gray-100 bg-white cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={onClick}
      >
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Várakozás generálásra</span>
      </div>
    )
  }

  return (
    <div 
      className="group h-full min-h-[200px] p-6 bg-white border-r border-b border-gray-100 hover:bg-gray-50/50 transition-colors flex flex-col items-start text-left relative cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full flex items-start justify-between mb-3">
        <TypeBadge type={message.message_type || 'core'} />
        <button 
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-primary-50"
          title="Másolás vágólapra"
        >
          {copied ? (
             <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      
      <h4 className="text-gray-900 font-display font-bold text-[15px] mb-2 leading-snug">
        {message.headline}
      </h4>
      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-light">
        {message.body}
      </p>
    </div>
  )
}
