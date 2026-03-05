'use client'

import { AnAgentChat, createAnChat } from '@an-sdk/nextjs'
import { useChat } from '@ai-sdk/react'
import theme from '@/app/theme.json'

const chat = createAnChat({
  agent: 'hr-assistant',
  tokenUrl: '/api/an-token',
})

export default function AIAssistantPage() {
  const { messages, status, stop, error } = useChat({ chat } as unknown as Record<string, unknown>)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto h-screen max-w-4xl py-4">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground">HR Assistant</h1>
            <p className="text-foreground-muted">Ask questions about HR policies, benefits, time off, and more</p>
          </div>

          <div className="flex-1 overflow-hidden rounded-lg border border-border">
            <AnAgentChat
              messages={messages}
              onSend={(message) => {
                // message is already in the correct format
              }}
              status={status}
              onStop={stop}
              error={error ?? undefined}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
