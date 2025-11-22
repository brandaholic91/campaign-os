'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import MessageForm from './MessageForm'
import { MessageMatrixPreview } from '@/components/ai/MessageMatrixPreview'
import { GeneratedMessage } from '@/lib/ai/schemas'
import { toast } from 'sonner'
import { CheckboxList } from './CheckboxList'
import { MatrixCell } from './MatrixCell'

type Message = Database['campaign_os']['Tables']['messages']['Row']
type Segment = Database['campaign_os']['Tables']['segments']['Row']
type Topic = Database['campaign_os']['Tables']['topics']['Row']

interface MessageMatrixProps {
  campaignId: string
  segments: Segment[]
  topics: Topic[]
  messages: Message[]
}

export default function MessageMatrix({
  campaignId,
  segments,
  topics,
  messages,
}: MessageMatrixProps) {
  const router = useRouter()
  const [selectedCell, setSelectedCell] = useState<{
    segmentId: string
    topicId: string
  } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // AI generation state
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const getMessageForCell = (segmentId: string, topicId: string) => {
    return messages.find(
      (m) => m.segment_id === segmentId && m.topic_id === topicId
    )
  }

  const handleCellClick = (segmentId: string, topicId: string) => {
    setSelectedCell({ segmentId, topicId })
    setIsDialogOpen(true)
  }

  const toggleSegment = (segmentId: string) => {
    const newSet = new Set(selectedSegments)
    if (newSet.has(segmentId)) {
      newSet.delete(segmentId)
    } else {
      newSet.add(segmentId)
    }
    setSelectedSegments(newSet)
  }

  const toggleTopic = (topicId: string) => {
    const newSet = new Set(selectedTopics)
    if (newSet.has(topicId)) {
      newSet.delete(topicId)
    } else {
      newSet.add(topicId)
    }
    setSelectedTopics(newSet)
  }

  const handleGenerateMessages = async () => {
    if (selectedSegments.size === 0 || selectedTopics.size === 0) {
      toast.error('Válassz ki legalább egy célcsoportot és egy témát')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/message-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          segment_ids: Array.from(selectedSegments),
          topic_ids: Array.from(selectedTopics),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate messages')
      }

      const data = await response.json()
      setGeneratedMessages(data.messages)
      setIsPreviewOpen(true)
      toast.success(`${data.messages.length} üzenet generálva`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Hiba történt a generálás során')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveMessages = async (messagesToSave: GeneratedMessage[]) => {
    setIsSaving(true)
    try {
      // Save messages one by one using existing API
      const savePromises = messagesToSave.map(message =>
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: message.campaign_id,
            segment_id: message.segment_id,
            topic_id: message.topic_id,
            headline: message.headline,
            body: message.body,
            proof_point: message.proof_point,
            cta: message.cta,
            message_type: message.message_type,
            status: 'draft',
          }),
        })
      )

      const results = await Promise.allSettled(savePromises)
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))
      
      if (failed.length > 0) {
        console.error('Some messages failed to save:', failed)
        toast.warning(`${failed.length} üzenet mentése sikertelen volt`)
      } else {
        toast.success(`${messagesToSave.length} üzenet sikeresen mentve`)
      }

      setIsPreviewOpen(false)
      setGeneratedMessages(null)
      setSelectedSegments(new Set())
      setSelectedTopics(new Set())
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Hiba történt a mentés során')
    } finally {
      setIsSaving(false)
    }
  }

  // Convert segments and topics to checkbox list format
  const segmentsForList = segments.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || undefined,
    selected: selectedSegments.has(s.id)
  }))

  const topicsForList = topics.map(t => ({
    id: t.id,
    name: t.name,
    subtitle: t.category || undefined,
    selected: selectedTopics.has(t.id)
  }))

  const selectedSegmentsArray = segments.filter(s => selectedSegments.has(s.id))
  const selectedTopicsArray = topics.filter(t => selectedTopics.has(t.id))
  const cellCount = selectedSegmentsArray.length * selectedTopicsArray.length

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-gray-900">
      {/* Main Workflow Area */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full px-6 py-8 flex flex-col gap-8">
        
        {/* Configuration Panel (Bento Grid Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Audience Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col">
            <CheckboxList 
              title="Célcsoportok" 
              count={selectedSegments.size}
              items={segmentsForList} 
              onToggle={toggleSegment} 
            />
          </div>

          {/* Topic Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex flex-col">
             <CheckboxList 
                title="Témák" 
                count={selectedTopics.size}
                items={topicsForList} 
                onToggle={toggleTopic} 
              />
          </div>

          {/* Action & Stats Panel */}
          <div className="lg:col-span-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-soft p-6 text-white flex flex-col justify-between relative overflow-hidden group">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10">
              <h3 className="text-lg font-display font-bold mb-1">AI Generátor</h3>
              <p className="text-gray-400 text-sm mb-6">Válaszd ki a paramétereket a személyre szabott marketing üzenetek létrehozásához.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <span className="block text-2xl font-bold">{cellCount}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Kombináció</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <span className="block text-2xl font-bold">{selectedTopicsArray.length * 2}s</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Becsült idő</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              <button
                onClick={handleGenerateMessages}
                disabled={isGenerating || cellCount === 0}
                className={`
                  w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all
                  ${isGenerating || cellCount === 0 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Generálás folyamatban...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Üzenetek Generálása
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Matrix View */}
        <div className="flex-1 flex flex-col">
            {selectedSegmentsArray.length > 0 && selectedTopicsArray.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden flex flex-col relative">
                <div className="overflow-auto custom-scrollbar flex-1 max-h-[800px]">
                  <div 
                    className="grid"
                    style={{
                      gridTemplateColumns: `minmax(280px, 320px) repeat(${selectedTopicsArray.length}, minmax(340px, 1fr))`
                    }}
                  >
                    {/* Corner Cell */}
                    <div className="sticky top-0 left-0 z-30 bg-gray-50/95 backdrop-blur-sm border-r border-b border-gray-200 p-6 flex flex-col justify-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Y tengely</span>
                      <span className="text-sm font-bold text-gray-900">Célcsoportok</span>
                      <div className="w-full h-px bg-gray-200 my-2 transform rotate-3 origin-left w-[110%]"></div>
                      <div className="self-end text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">X tengely</span>
                        <span className="text-sm font-bold text-gray-900">Témák</span>
                      </div>
                    </div>

                    {/* Header Row (Topics) */}
                    {selectedTopicsArray.map(topic => (
                      <div key={topic.id} className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-r border-b border-gray-200 p-6 flex flex-col justify-center min-h-[120px]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">T</span>
                            <h3 className="text-gray-900 font-display font-bold text-sm leading-tight">{topic.name}</h3>
                        </div>
                        {topic.category && <p className="text-gray-500 text-xs font-medium pl-8">{topic.category}</p>}
                      </div>
                    ))}

                    {/* Rows (Audiences + Cells) */}
                    {selectedSegmentsArray.map(segment => (
                      <React.Fragment key={segment.id}>
                        {/* Sticky Row Header (Audience) */}
                        <div className="sticky left-0 z-10 bg-white border-r border-b border-gray-200 p-6 group transition-colors hover:bg-gray-50">
                           <div className="h-full flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">A</span>
                                <h3 className="text-gray-900 font-display font-bold text-sm">{segment.name}</h3>
                            </div>
                            {segment.description && (
                              <p className="text-gray-500 text-xs leading-relaxed pl-8">
                                {segment.description}
                              </p>
                            )}
                           </div>
                        </div>

                        {/* Data Cells */}
                        {selectedTopicsArray.map(topic => {
                          const message = getMessageForCell(segment.id, topic.id)
                          return (
                            <MatrixCell
                              key={`${segment.id}-${topic.id}`}
                              message={message}
                              onClick={() => handleCellClick(segment.id, topic.id)}
                            />
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-display font-bold text-xl mb-2">Kezdjük el a tervezést</h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Válassz legalább egy <span className="text-blue-600 font-medium">célcsoportot</span> és egy <span className="text-primary-600 font-medium">témát</span> a fenti panelen a mátrix megjelenítéséhez.
                </p>
              </div>
            )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {getMessageForCell(selectedCell?.segmentId || '', selectedCell?.topicId || '')
                ? 'Edit Message'
                : 'Create Message'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedCell && (
              <MessageForm
                campaignId={campaignId}
                segmentId={selectedCell.segmentId}
                topicId={selectedCell.topicId}
                initialData={getMessageForCell(
                  selectedCell.segmentId,
                  selectedCell.topicId
                )}
                onSuccess={() => setIsDialogOpen(false)}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generated Messages Preview */}
      {isPreviewOpen && generatedMessages && (
        <MessageMatrixPreview
          messages={generatedMessages}
          segments={segments}
          topics={topics}
          campaignId={campaignId}
          onSave={handleSaveMessages}
          onCancel={() => {
            setIsPreviewOpen(false)
            setGeneratedMessages(null)
          }}
          onRegenerate={(regeneratedMessages) => {
            // Update the generated messages with regenerated ones
            setGeneratedMessages(prev => {
              if (!prev) return regeneratedMessages
              const updatedMap = new Map(regeneratedMessages.map(msg => [`${msg.segment_id}:${msg.topic_id}`, msg]))
              return prev.map(msg => {
                const key = `${msg.segment_id}:${msg.topic_id}`
                return updatedMap.get(key) || msg
              })
            })
          }}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}