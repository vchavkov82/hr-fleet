export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">HR Assistant</h1>
          <p className="text-foreground-muted mb-8 text-lg">
            Ask questions about HR policies, benefits, time off, and more
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 inline-block">
            <p className="text-sm text-gray-600">
              AI Assistant setup pending. Please configure your API key in .env.local
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
