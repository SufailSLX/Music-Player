"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Play, Heart, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  duration?: string
  publishedAt?: string
}

interface YouTubeSearchProps {
  onVideoSelect: (video: YouTubeVideo) => void
  onAddToFavorites: (video: YouTubeVideo) => void
  favorites: YouTubeVideo[]
}

export function YouTubeSearch({ onVideoSelect, onAddToFavorites, favorites }: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 1) {
        fetchSuggestions(searchQuery.trim())
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("youtube-recent-searches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load recent searches:", e)
      }
    }
  }, [])

  const fetchSuggestions = async (query: string) => {
    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (response.ok && data.suggestions) {
        setSuggestions(data.suggestions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Suggestions error:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const searchYouTube = async (query: string) => {
    setIsSearching(true)
    setError(null)
    setShowSuggestions(false)

    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      const updatedRecent = [trimmedQuery, ...recentSearches.filter((s) => s !== trimmedQuery)].slice(0, 5)
      setRecentSearches(updatedRecent)
      localStorage.setItem("youtube-recent-searches", JSON.stringify(updatedRecent))
    }

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=12`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to search YouTube")
      }

      setSearchResults(data.videos || [])
    } catch (error) {
      console.error("Search error:", error)
      setError(error instanceof Error ? error.message : "Failed to search YouTube")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchYouTube(searchQuery.trim())
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    searchYouTube(suggestion)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0 || recentSearches.length > 0) {
      setShowSuggestions(true)
    }
  }

  const isVideoFavorited = (videoId: string) => {
    return favorites.some((fav) => fav.id === videoId)
  }

  const handleFavoriteToggle = (video: YouTubeVideo) => {
    if (isVideoFavorited(video.id)) {
      toast({ title: "Already in favorites", description: "This video is already in your favorites." })
    } else {
      onAddToFavorites(video)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Form */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative" ref={suggestionsRef}>
            <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
              <Input
                type="text"
                placeholder="Search for music on YouTube..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleInputFocus}
                className="flex-1 text-base sm:text-base h-12 sm:h-10"
              />
              <Button type="submit" disabled={isSearching} className="text-sm sm:text-base h-12 sm:h-10 px-4 sm:px-6">
                <Search className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isSearching ? "Searching..." : "Search"}</span>
                <span className="sm:hidden">{isSearching ? "..." : "Go"}</span>
              </Button>
            </form>

            {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#121212] border border-gray-700 rounded-md shadow-xl max-h-80 overflow-y-auto">
                {recentSearches.length > 0 && searchQuery.length === 0 && (
                  <div className="border-b border-gray-700">
                    <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                      Recent searches
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 text-gray-400">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                            </svg>
                          </div>
                          <span className="truncate flex-1">{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div>
                    {recentSearches.length > 0 && searchQuery.length === 0 && (
                      <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Suggestions
                      </div>
                    )}
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors duration-150 border-b border-gray-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate flex-1">{suggestion}</span>
                          <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isLoadingSuggestions && searchQuery.length > 1 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#121212] border border-gray-700 rounded-md shadow-xl">
                <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-[#1DB954]"></div>
                  <span>Loading suggestions...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.includes("API key") ? (
              <div className="space-y-2">
                <p className="font-medium">YouTube API Key Required</p>
                <p className="text-sm">
                  To use YouTube search, you need to add a YOUTUBE_API_KEY environment variable. Get your API key from
                  the Google Cloud Console and add it to your project settings.
                </p>
              </div>
            ) : (
              error
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">Search Results</h2>
          <div className="grid gap-4 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {searchResults.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-40 sm:h-48 object-cover"
                    loading="lazy"
                  />
                  {video.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">{video.duration}</Badge>
                  )}
                </div>
                <CardContent className="p-4 sm:p-4">
                  <h3
                    className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 leading-tight"
                    title={video.title}
                  >
                    {video.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 truncate" title={video.channelTitle}>
                    {video.channelTitle}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onVideoSelect(video)} className="flex-1 text-sm min-h-[40px]">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant={isVideoFavorited(video.id) ? "default" : "outline"}
                      onClick={() => handleFavoriteToggle(video)}
                      className="px-3 min-h-[40px] min-w-[40px]"
                      title={isVideoFavorited(video.id) ? "Already in favorites" : "Add to favorites"}
                    >
                      {isVideoFavorited(video.id) ? (
                        <Heart className="w-4 h-4 fill-current" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && !error && (
        <div className="text-center py-12 sm:py-16">
          <Search className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3">Search for Music</h3>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto px-4">
            Enter a song name, artist, or any music-related search term to find videos on YouTube.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="text-center py-12 sm:py-16">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary mx-auto mb-4 sm:mb-6"></div>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Searching YouTube...</p>
        </div>
      )}
    </div>
  )
}
