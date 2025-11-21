'use client'

import { useState } from 'react'
import { useCopilotChatSuggestions } from '@copilotkit/react-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AssistantChatProps {
  className?: string
}

export function AssistantChat({ className }: AssistantChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // For now, simple message append without real CopilotKit streaming
  // In production, this would integrate with CopilotKit's chat API
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response (in production, this would be CopilotKit streaming)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: 'Segíthetek! Kérdezz bármit a kampány létrehozásával kapcsolatban.',
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
            'bg-primary hover:bg-primary/90 transition-all duration-200',
            'hover:scale-110',
            className
          )}
          aria-label="Kampánysegéd megnyitása"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-full max-w-md h-[600px]',
            'sm:w-96',
            'bg-background border border-border rounded-lg shadow-2xl',
            'flex flex-col',
            'transition-all duration-300 ease-in-out',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Kampánysegéd</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Kampánysegéd bezárása"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p>Szia! 👋</p>
                <p className="mt-2">Segíthetek a kampány létrehozásában.</p>
                <p className="mt-1">Kérdezz bármit!</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Gondolkodom...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-muted/50">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Írj egy üzenetet..."
                disabled={isLoading}
                className="flex-1"
                aria-label="Üzenet bevitele"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                aria-label="Üzenet küldése"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
