'use client'

import { useState } from 'react'
import { Target, MessageSquare } from 'lucide-react'
import { GoalsManagerModal } from './GoalsManagerModal'
import { NarrativesManagerModal } from './NarrativesManagerModal'

interface DashboardCardsProps {
  campaignId: string
  goalsCount: number
  narrativesCount: number
}

export function DashboardCards({ campaignId, goalsCount, narrativesCount }: DashboardCardsProps) {
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
  const [isNarrativesModalOpen, setIsNarrativesModalOpen] = useState(false)

  return (
    <>
      {/* Goals Card */}
      <div 
        onClick={() => setIsGoalsModalOpen(true)}
        className="group bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-md hover:border-amber-200 transition-all cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Target className="w-6 h-6" />
        </div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Célok</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Kampány célok és KPI-ok kezelése</p>
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-100 pt-3">
          <span>{goalsCount} aktív cél</span>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Narratives Card */}
      <div 
        onClick={() => setIsNarrativesModalOpen(true)}
        className="group bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Narratívák</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Üzenetek és történetek kezelése</p>
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-100 pt-3">
          <span>{narrativesCount} narratíva</span>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      <GoalsManagerModal 
        isOpen={isGoalsModalOpen} 
        onClose={() => setIsGoalsModalOpen(false)} 
        campaignId={campaignId} 
      />

      <NarrativesManagerModal 
        isOpen={isNarrativesModalOpen} 
        onClose={() => setIsNarrativesModalOpen(false)} 
        campaignId={campaignId} 
      />
    </>
  )
}
