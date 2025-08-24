"use client"

import type React from "react"

import { useState } from "react"
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
  const { toast } = useToast()

  const searchYouTube = async (query: string) => {
    setIsSearching(true)
    setError(null)

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
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for music on YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm sm:text-base"
            />
            <Button type="submit" disabled={isSearching} className="text-sm">
              <Search className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{isSearching ? "Searching..." : "Search"}</span>
              <span className="sm:hidden">{isSearching ? "..." : "Go"}</span>
            </Button>
          </form>
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
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Search Results</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {searchResults.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-36 sm:h-48 object-cover"
                    loading="lazy"
                  />
                  {video.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">{video.duration}</Badge>
                  )}
                </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 leading-tight" title={video.title}>
                    {video.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 truncate" title={video.channelTitle}>
                    {video.channelTitle}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onVideoSelect(video)} className="flex-1 text-xs sm:text-sm">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant={isVideoFavorited(video.id) ? "default" : "outline"}
                      onClick={() => handleFavoriteToggle(video)}
                      className="px-2 sm:px-3"
                      title={isVideoFavorited(video.id) ? "Already in favorites" : "Add to favorites"}
                    >
                      {isVideoFavorited(video.id) ? (
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      ) : (
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <div className="text-center py-8 sm:py-12">
          <Search className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">Search for Music</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Enter a song name, artist, or any music-related search term to find videos on YouTube.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Searching YouTube...</p>
        </div>
      )}
    </div>
  )
}
