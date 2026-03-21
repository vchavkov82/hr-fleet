'use client'

import { useState } from 'react'

interface ArticleFeedbackProps {
    articleId: string
    className?: string
}

export function ArticleFeedback({ articleId: _articleId, className = '' }: ArticleFeedbackProps) {
    const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showThankYou, setShowThankYou] = useState(false)

    const handleFeedback = async (type: 'helpful' | 'not-helpful') => {
        if (feedback || isSubmitting) return

        setIsSubmitting(true)

        try {
            // In a real app, this would send feedback to your backend
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call

            setFeedback(type)
            setShowThankYou(true)

            // Hide thank you message after 3 seconds
            setTimeout(() => setShowThankYou(false), 3000)
        } catch (error) {
            console.error('Failed to submit feedback:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={`mt-12 pt-8 border-t border-gray-200 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Was this helpful?</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFeedback('helpful')}
                            disabled={feedback !== null || isSubmitting}
                            className={`px-3 py-1 text-sm border rounded transition-colors ${feedback === 'helpful'
                                    ? 'bg-green-50 border-green-300 text-green-700'
                                    : 'border-gray-300 hover:bg-gray-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            👍 {feedback === 'helpful' ? 'Thanks!' : 'Yes'}
                        </button>
                        <button
                            onClick={() => handleFeedback('not-helpful')}
                            disabled={feedback !== null || isSubmitting}
                            className={`px-3 py-1 text-sm border rounded transition-colors ${feedback === 'not-helpful'
                                    ? 'bg-red-50 border-red-300 text-red-700'
                                    : 'border-gray-300 hover:bg-gray-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            👎 {feedback === 'not-helpful' ? 'Thanks!' : 'No'}
                        </button>
                    </div>
                </div>

                {showThankYou && (
                    <div className="text-sm text-green-600 animate-pulse">
                        Thank you for your feedback!
                    </div>
                )}

                <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    📧 Email article
                </button>
            </div>

            {feedback === 'not-helpful' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                        We&apos;re sorry this article wasn&apos;t helpful. Would you like to:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Contact support
                        </button>
                        <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Suggest an edit
                        </button>
                        <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Report an issue
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
