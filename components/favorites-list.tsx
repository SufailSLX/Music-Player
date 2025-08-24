"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Trash2, Heart } from "lucide-react"

interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  duration?: string
}

interface FavoritesListProps {
  favorites: YouTubeVideo[]
  currentVideo: YouTubeVideo | null
  onVideoSelect: (video: YouTubeVideo) => void
  onRemoveFromFavorites: (videoId: string) => void
}

export function FavoritesList({ favorites, currentVideo, onVideoSelect, onRemoveFromFavorites }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">No Favorites Yet</h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          Search for music and add videos to your favorites to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">My Favorites</h2>
        <Badge variant="secondary" className="text-xs sm:text-sm">
          {favorites.length} {favorites.length === 1 ? "song" : "songs"}
        </Badge>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((video) => (
          <Card
            key={video.id}
            className={`overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${
              currentVideo?.id === video.id ? "ring-2 ring-primary shadow-lg" : ""
            }`}
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
              {currentVideo?.id === video.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm font-medium">
                    Now Playing
                  </Badge>
                </div>
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
                <Button
                  size="sm"
                  onClick={() => onVideoSelect(video)}
                  className="flex-1 text-xs sm:text-sm"
                  disabled={currentVideo?.id === video.id}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {currentVideo?.id === video.id ? "Playing" : "Play"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveFromFavorites(video.id)}
                  className="px-2 sm:px-3"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
