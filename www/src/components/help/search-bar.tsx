'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProps {
    placeholder?: string
    className?: string
}

export function SearchBar({ placeholder, className = '' }: SearchBarProps) {
    const t = useTranslations('helpCenter')
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams?.get('q') || '')
    const [isSearching, setIsSearching] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const currentQuery = searchParams?.get('q')
        if (currentQuery && currentQuery !== query) {
            setQuery(currentQuery)
        }
    }, [searchParams, query])

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return

        setIsSearching(true)
        const params = new URLSearchParams()
        params.set('q', searchQuery.trim())
        router.push(`/en/help-center/search?${params.toString()}`)

        setTimeout(() => setIsSearching(false), 300)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(query)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch(query)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || t('hero.searchPlaceholder')}
                className="w-full px-6 py-4 pr-12 rounded-lg text-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                aria-label="Search help articles"
            />
            <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                aria-label="Search"
                disabled={isSearching}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </form>
    )
}
